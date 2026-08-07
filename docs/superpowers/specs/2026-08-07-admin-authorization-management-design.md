# Admin Authorization Management Design

- **Date:** 2026-08-07
- **Status:** Approved in conversation
- **Primary repository:** `manga-go-fe`
- **Backend dependency:** `manga-go`

## Summary

Build a permission-driven admin interface that lets authorized operators find users in the system, replace their platform roles, create/rename/describe/delete roles, replace the permissions granted by a role, and review an immutable authorization audit log.

The Go backend remains authoritative. Casbin and `casbin_rule` own user-to-role assignments and role-to-permission grants. The frontend reads a cached authorization profile from the backend and never infers admin access from a role name. The feature spans both repositories because the current backend does not expose the user search, self-authorization profile, role-usage metadata, safety invariants, or audit APIs required by the approved UI.

## Current State and Problems

The frontend already contains `/admin`, `/admin/users`, `/admin/roles`, and components for assigning roles and permissions. They cannot be treated as a finished base because they target the pre-Casbin contract:

- The frontend calls `GET /permissions/all`; the current backend exposes only `GET /permissions`.
- The frontend sends `permissionIds`; the backend accepts permission names in `{ "permissions": string[] }`.
- `PermissionEntity` assumes persisted permission IDs, while the backend catalog is code-defined and keyed by names such as `comic:read`.
- The user-role component mixes `roleIds` and `role_ids`.
- `RbacProvider` expects an object with `roles`, although `getUserRoles` is typed as returning `Role[]`.
- `RbacProvider` and `RolesSyncProvider` call `GET /users/:id/roles` for ordinary users, but the backend now protects that endpoint with `role:manage`.
- Admin access and navigation are partly hardcoded to `admin` and `superadmin`, which is incompatible with editable/deletable roles.
- The current user screen requires a raw UUID because no admin user-list/search API exists.
- The role UI offers a description, but the backend role model does not persist one.
- There is no authorization audit log.

The current frontend verification baseline is also not clean. Production build attempts are blocked when `next/font` cannot fetch Google Fonts, and `tsc --noEmit` reports both RBAC-related and unrelated existing errors. The implementation plan must distinguish feature regressions from this baseline and must not claim a clean full build until the repository-wide failures are resolved.

## Goals

- Let an authorized operator find users by name or email and filter them by role.
- Let a user hold zero, one, or multiple platform roles.
- Calculate a user's visible effective permissions as the union of assigned role grants.
- Manage role metadata and permissions through a responsive, accessible workspace.
- Permit every role to be created, renamed, described, or deleted when safety constraints allow it.
- Prevent accidental lockout and prevent deletion of roles that are still assigned.
- Gate admin navigation and routes by backend permission names, not role names.
- Cache self-authorization profiles in Redis with safe invalidation.
- Record immutable before/after audit events for every authorization mutation.
- Add automated frontend and backend coverage for permission-sensitive behavior.

## Non-Goals

- Direct permissions or exceptions assigned to an individual user.
- Editing Casbin deny rules or context-specific policies in the UI.
- Translation-group-scoped membership and group-role administration.
- Bulk-changing roles for multiple users in one operation.
- Editing or deleting audit records.
- Audit export, cold storage, or automatic retention expiry.
- Replacing every non-admin semantic gate in the product. This feature replaces role-name-based admin access; broader contextual authorization remains server-enforced and can be migrated separately.

## Product Decisions

- Permissions are granted only to roles; users inherit the union of their roles.
- Users may have no role and still retain the backend's authenticated baseline policies.
- All roles are administratively editable and deletable, subject to safety checks.
- A role with assigned users cannot be deleted; users must first be reassigned or unassigned.
- An operator cannot remove their own final effective `role:manage` permission.
- The system must always retain at least one user with effective `role:manage`.
- Permission changes are staged and saved explicitly. The UI shows additions and removals before confirmation.
- Backend `write` remains one grant that expands to create, update, and publish. The UI labels it “Ghi” and explains the expansion in a tooltip.
- Authorization audit records are append-only and retained indefinitely for this phase.
- Viewing the authorization audit requires the independent `audit_log:read` permission.

## Architecture

### Source of truth

Casbin remains the authorization decision engine:

- `g, <user-id>, <role-id>, platform` stores platform role membership.
- `p, platform, <role-id>, <action>, <object>, any, allow` stores role grants.
- The `roles` table stores only display metadata: `id`, `name`, `description`, and timestamps.
- The code-defined permission catalog remains the only valid permission vocabulary.
- The new audit table records mutation history but is not used to make authorization decisions.

All protected backend routes continue to enforce authorization independently of the frontend. Hiding a tab or button is an experience improvement, not a security boundary.

### Self-authorization profile

Add `GET /users/me/authorization`, protected only by valid authentication because every signed-in user must be able to inspect their own platform grants.

Example response data:

```json
{
  "userId": "4d8c...",
  "roles": [
    {
      "id": "29b1...",
      "name": "admin",
      "description": "Platform administration"
    }
  ],
  "permissions": ["audit_log:read", "permission:read", "role:manage", "user:read"],
  "version": "g12:u4"
}
```

`permissions` contains every catalog permission for which the current subject is globally allowed in `CtxAny`. The backend evaluates the catalog definitions rather than returning only raw policy names, so Casbin implications are preserved: for example, `user:manage` also makes `user:read`, `user:write`, and `user:delete` effective, while `write` is effective only when all actions in its expansion are allowed. This list is intended for coarse UI capabilities. Object ownership, group membership, published state, deny rules, and other contextual decisions remain backend-only.

The frontend stores this response in TanStack Query, not Zustand. A single authorization provider exposes loading state and permission checks. It replaces the two current role-sync providers and removes all `admin`/`superadmin` name checks from admin navigation and layouts.

### Redis cache and invalidation

The profile cache uses two durable revisions:

- A global revision changes when a role's grants, name, description, or existence changes.
- A per-user revision changes when that user's role assignments change.

PostgreSQL is authoritative for these revisions through an `authorization_cache_revisions` table keyed by `global` or `user:<user-id>`. The endpoint performs a small indexed revision lookup before addressing Redis. This prevents Redis downtime during a mutation from making an old profile readable when Redis later recovers.

Profile keys include both revisions:

```text
authorization:profile:g<global-version>:u<user-version>:user:<user-id>
```

Profile entries expire after 10 minutes. Old versioned entries do not become readable after an invalidation and disappear naturally through TTL.

Mutation behavior:

- Replacing one user's roles increments that user's durable revision and deletes the known current Redis profile key on a best-effort basis.
- Updating role permissions, changing role metadata, or deleting a role increments the durable global revision.
- Creating an unassigned role does not invalidate existing profiles.
- Revision changes are committed with the audit record after the authorization mutation succeeds. Redis deletion happens afterward and is an optimization because the previous versioned key is already unreachable.
- If Redis cannot be read, the endpoint calculates from the current Casbin state and does not read or write a potentially stale cache.
- Redis failures are logged and measured, but they do not make the profile endpoint unavailable.

Versioned keys prevent a request that began before invalidation from repopulating the active cache generation with stale data.

## Backend API Contracts

### Read endpoints

- `GET /users/me/authorization`
  - Returns the current user's role summaries, effective platform permission names, and composite version.
- `GET /users?page=<n>&limit=<n>&search=<text>&role_id=<uuid>`
  - Requires `user:read`.
  - Searches case-insensitively by name or email.
  - Returns a paginated user summary with roles embedded to avoid N+1 requests.
- `GET /roles/all`
  - Requires `role:manage`.
  - Returns role metadata, permission names, and `assignedUserCount`, allowing the user panel to preview effective permissions without per-role requests.
- `GET /roles/:id`
  - Requires `role:manage`.
  - Returns metadata and permission names.
- `GET /permissions`
  - Requires `permission:read`.
  - Returns the code-defined catalog with `name`, `object`, `action`, `grants`, and `contexts`.
- `GET /authorization/audit-logs`
  - Requires `audit_log:read`.
  - Supports page, limit, actor, action, target type, target ID, start time, and end time filters.

### Mutation endpoints

- `POST /roles` requires `role:manage` and creates a role with `name` and optional `description`.
- `PUT /roles/:id` requires `role:manage` and updates `name` and `description`.
- `DELETE /roles/:id` requires `role:manage` and deletes an unassigned role after safety validation.
- `POST /roles/:id/permissions` requires `role:manage`, replaces the complete grant set using `{ "permissions": string[] }`, and accepts an empty array.
- `POST /users/:id/roles` requires `role:manage`, replaces the complete platform-role set using `{ "role_ids": string[] }`, and accepts an empty array.

Successful mutations return the updated resource or assignment summary so the frontend can update or invalidate its queries deterministically. Validation and conflict responses expose a stable machine-readable error code in addition to the human-readable message.

## Safety and Mutation Consistency

All authorization administration mutations run through one application service rather than duplicating policy, safety, audit, and cache behavior across handlers.

Before mutation, the service captures the current state and validates the complete requested replacement. It serializes authorization mutations so concurrent operators cannot independently pass the “last manager” check. It then applies the proposed change, verifies these postconditions, writes the audit event, and invalidates the relevant Redis generation:

- A role with one or more assigned users cannot be deleted.
- The acting user retains effective `role:manage` after their own mutation.
- At least one user in the platform retains effective `role:manage`.
- Every submitted role ID exists.
- Every submitted permission name exists in the catalog.

Expected business conflicts return HTTP `409` with stable codes such as `ROLE_IN_USE`, `SELF_MANAGE_REQUIRED`, `LAST_ROLE_MANAGER`, and `AUTHORIZATION_STATE_CHANGED`. Invalid identifiers or catalog values return `400`; missing records use the project's established not-found response convention.

If a policy write succeeds but audit persistence fails, the service restores the captured policy state before returning an error. Cache invalidation occurs only after the policy and audit are durable. The audit row therefore represents a completed state transition rather than an attempted transition.

## Audit Data Model

Add an append-only `authorization_audit_logs` table with:

- `id`
- `actor_user_id`, nullable only for future system actors
- `actor_name_snapshot`
- `actor_email_snapshot`
- `action`
- `target_type`
- `target_id`
- `target_name_snapshot`
- `before` JSONB
- `after` JSONB
- `created_at`

Recorded actions are:

- `role.created`
- `role.updated`
- `role.deleted`
- `role.permissions_replaced`
- `user.roles_replaced`

Snapshots keep the audit understandable after a role is renamed or deleted. The API never exposes mutation or deletion methods for this table.

## Frontend Information Architecture

The admin sidebar contains one “Phân quyền” item. It leads to three deep-linkable routes:

- `/admin/access/users`
- `/admin/access/roles`
- `/admin/access/audit`

`/admin/access` redirects to the first tab the current user may access. Legacy `/admin/users` and `/admin/roles` routes redirect to their new equivalents.

The parent access layout renders when the current user has at least one relevant permission. Individual tabs are hidden and route-gated:

- Users requires both `user:read` and `role:manage`.
- Roles & permissions requires both `role:manage` and `permission:read`.
- Audit requires `audit_log:read`.

The header's Admin entry appears when at least one admin destination is accessible. Neither the header nor route layouts compare role names.

## Frontend Screens

### Users tab

- Render a paginated table with name, email, and assigned-role badges.
- Search by name/email with a short debounce and filter by role.
- Selecting a row opens a right-side detail panel; at mobile sizes it becomes a full-screen sheet.
- The panel exposes a multi-role selector and a read-only preview of the union of role permissions.
- Changes remain local until Save.
- Before submission, show roles and effective permissions added and removed.
- Require an explicit confirmation when the proposed diff adds or removes `role:manage`.
- On success, close the panel, invalidate the user list/detail, and invalidate the self-authorization query when the target is the current user.

### Roles & permissions tab

- Desktop: role rail on the left and role details/permission matrix on the right.
- Mobile: role dropdown followed by resource accordions.
- Generate rows and available action cells from `GET /permissions`; do not hardcode catalog objects.
- Group permission labels by object and map actions to localized labels: Đọc, Ghi, Xóa, Quản lý.
- Explain that Ghi expands to create, update, and publish.
- Allow name and description editing alongside the permission matrix.
- Keep permission changes local until Save and show a before/after diff.
- Show `assignedUserCount` in the role list and deletion dialog.
- Require the operator to type the exact role name before deletion.
- Disable or reject deletion while `assignedUserCount > 0`, while treating the backend `409` as authoritative.

### Audit tab

- Render timestamp, actor, action, target, and a concise diff summary.
- Filter by actor, action, target, and date range with server-side pagination.
- Selecting a row opens a read-only details panel with human-readable before/after values.
- Provide no edit, delete, export, or retention controls.

## Client Data Flow

- Add centralized query keys for the self profile, user search, roles, role details, catalog, and audit list.
- Use TanStack Query for every server value.
- Configure the self profile with a 30-second stale time, a 60-second refetch interval while the document is visible, and refetch-on-window-focus. Backend `403` responses still trigger an immediate refresh, so revocations are enforced even before the next scheduled query.
- Use component-local state for an unsaved role or permission draft.
- Mutations disable duplicate submission but do not discard the draft on failure.
- Successful mutations invalidate only affected server queries, plus the self profile where relevant.
- A `403` triggers one authorization-profile refetch. If access is still absent, navigate to the first accessible admin tab or home and show a concise notification.
- A `401` follows the existing logout/login flow.
- A `409` maps stable backend codes to specific Vietnamese guidance.
- Network and `5xx` errors preserve the draft and offer Retry.

## Loading, Empty, and Accessibility States

- Authorization loading uses a skeleton and never briefly renders protected content or a false denial.
- Tables use shape-matched skeleton rows.
- Empty states distinguish no records from no search results and offer an appropriate clear-filter or create-role action.
- Errors include an icon, message, and retry action.
- All controls are keyboard reachable with visible focus rings.
- Icon-only controls have accessible labels.
- Dialogs and sheets trap focus and restore it on close.
- Mobile touch targets are at least 44px.
- Permission state is never communicated by color alone.
- The screens support light/dark themes at 375px and 1280px widths.

## Testing Strategy

### Backend

- Authorization profile calculation for zero, one, and multiple roles.
- Redis cache hit, miss, TTL, per-user revision, global revision, and Redis-unavailable fallback.
- Invalidation after user-role and role-permission mutations.
- Endpoint middleware for `user:read`, `role:manage`, `permission:read`, and `audit_log:read`.
- User search, role filtering, embedded roles, and pagination.
- Empty role and permission replacement payloads.
- Role-in-use, self-lockout, and last-manager conflicts, including concurrent mutation coverage.
- Audit before/after snapshots for every action.
- Audit filtering, ordering, and pagination.
- Restoration of captured policy state when audit persistence fails.

### Frontend

Add Vitest and React Testing Library as approved development dependencies. Cover:

- Authorization provider loading, success, refresh, denied access, and Redis-transparent API behavior.
- Permission gates using permission names rather than roles.
- Route/tab visibility for users with different grant combinations.
- User search/filter/pagination and multi-role draft behavior.
- Effective permission union and added/removed diff calculation.
- Permission matrix generation from catalog data and Ghi tooltip.
- Role create/edit/delete confirmations and role-in-use conflicts.
- `401`, `403`, `409`, network, and retry behavior.
- Audit filters and before/after detail rendering.

Run focused tests during each task, then Go test suites, frontend lint, format check, TypeScript/build, and manual responsive/dark-mode checks. The implementation must document any pre-existing repository-wide verification failures that remain outside the feature scope.

## Rollout

1. Add migrations for `roles.description`, `authorization_audit_logs`, and `authorization_cache_revisions`.
2. Add `audit_log` to the authorization catalog with the grantable `read` action.
3. Update the admin seed to include `audit_log:read`.
4. Implement backend profile/cache, administration APIs, safety rules, and audit behavior.
5. Deploy the backend before the frontend so the new contracts are available.
6. Implement the frontend provider, routes, tabs, screens, and legacy redirects.
7. Remove obsolete admin role-name gates, stale RBAC contracts, and duplicate role-sync providers.
8. Verify cache invalidation and access revocation across two authenticated sessions before release.

The existing seeder remains an explicit bootstrap/reset operation rather than an application-startup reconciliation mechanism. Running it may recreate the named default roles and grants; ordinary application restarts do not overwrite roles customized through the admin UI.

## Success Criteria

- An authorized operator can find any system user by name/email and replace zero or more roles.
- An authorized operator can create, rename, describe, and safely delete roles.
- An authorized operator can replace a role's permissions using the live backend catalog.
- Admin access is unchanged by renaming a role because it depends on permissions.
- Self-lockout, deletion of assigned roles, and removal of the last role manager are blocked by the backend.
- Authorization-profile changes become visible without re-login through Redis revision invalidation and frontend query refresh.
- Every successful authorization mutation produces an immutable, filterable audit record with before/after data.
- The three admin tabs work on mobile and desktop, in light and dark modes, with accessible loading/error/empty behavior.
- New automated tests pass, and the final verification report distinguishes feature results from known repository baseline failures.
