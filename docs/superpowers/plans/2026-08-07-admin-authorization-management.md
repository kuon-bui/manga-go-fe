# Admin Authorization Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a permission-driven admin area where authorized operators manage user roles, role permissions, and immutable authorization audit history across the Go backend and Next.js frontend.

**Architecture:** Casbin remains authoritative for assignments and grants. PostgreSQL stores role metadata, audit events, and durable cache revisions; Redis stores version-addressed self-authorization profiles. The frontend reads that profile through TanStack Query, uses permission-name gates for admin navigation, and implements three deep-linkable admin tabs.

**Tech Stack:** Go 1.25, Gin, GORM, Casbin v3, PostgreSQL, Redis; Next.js 15 App Router, React 19, TypeScript 5.8 strict, TanStack Query 5, Zustand 5, Tailwind CSS 3.4, shadcn/Radix UI, Vitest, React Testing Library, Yarn.

## Global Constraints

- Casbin and `casbin_rule` are the source of truth for `user → role → permissions`; never recreate assignment tables.
- Permissions are assigned only through roles. Do not add direct user permission exceptions.
- Admin access must use backend permission names; never compare against `admin` or `superadmin` role names.
- Users may hold zero, one, or multiple roles.
- No role name is reserved or hardcoded against create, rename, or delete; only the approved safety invariants can block a mutation.
- `write` remains one catalog grant that expands to create, update, and publish.
- Role/user mutations must block `ROLE_IN_USE`, `SELF_MANAGE_REQUIRED`, `LAST_ROLE_MANAGER`, and stale-state conflicts (`AUTHORIZATION_STATE_CHANGED`) with HTTP `409` plus a stable `code`.
- Authorization audit events are append-only and retained indefinitely; there are no edit, delete, export, or retention controls.
- Redis profile TTL is exactly 10 minutes. Durable global/per-user revisions make stale keys unreachable.
- Frontend self-profile timing is exactly 30-second `staleTime`, 60-second visible-document refetch, refetch on focus, and immediate refetch after `403`.
- Frontend files use kebab-case, TypeScript stays strict, and `any` is forbidden.
- TanStack Query owns all server state. Zustand must not store roles or permissions.
- Components are mobile-first, support 375px and 1280px widths, dark mode, keyboard navigation, visible focus, and 44px touch targets.
- Preserve unrelated user changes in backend files `cmd/seed/main.go` and `internal/pkg/gorm/gorm.go`.
- Protected FE config files (`tailwind.config.ts`, `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `.prettierrc`) are not modified.
- Known baseline: `next/font` requires network access during build, and unrelated TypeScript errors currently exist in dashboard, notification, and reader files. Do not broaden implementation scope silently; do not claim the feature complete while the repository-wide build gate remains red.

---

## File Structure Map

### Backend: `C:\Users\kuon\code\manga-go`

Create:

- `migrations/20260807_100000_add_authorization_admin_support.sql` — role description, immutable audit table, durable revision table, indexes, and down migration.
- `internal/pkg/model/authorization_audit_log.go` — audit persistence model.
- `internal/pkg/model/authorization_cache_revision.go` — durable revision persistence model.
- `internal/pkg/repo/authorization_audit/repo.go` and `fx.go` — append and filtered audit reads.
- `internal/pkg/repo/authorization_revision/repo.go` and `fx.go` — read/bump global and per-user revisions.
- `internal/pkg/request/authorization/list_audit_logs.go` — audit filters and pagination.
- `internal/pkg/request/user/list_authorization_users.go` — admin user search/filter query.
- `internal/pkg/services/authorization_admin/` — shared profile, Redis cache, reads, audit, mutation lock/coordinator, types, tests, and Fx module.
- `internal/app/api/route/authorization/` — audit HTTP route, handler, tests, and Fx module.
- `internal/app/api/route/user/get_my_authorization.go` — self-profile handler.
- `internal/app/api/route/user/get_users.go` — admin user-list handler.

Modify:

- `internal/pkg/model/role.go`
- `internal/pkg/authorization/constants.go`, `catalog.go`, `catalog_test.go`, `policy_manager.go`, `policy_manager_test.go`
- `internal/pkg/seeder/role/seeder.go`
- `internal/pkg/request/role/create.go`, `update.go`, `assign_permission.go`
- `internal/pkg/request/user/assign_role.go`
- `internal/app/api/common/response/type.go`, `response.go`, and response tests
- `internal/pkg/repo/fx.go`, `internal/pkg/services/fx.go`, `internal/app/api/route/fx.go`
- `internal/pkg/repo/user/repo.go`
- `internal/pkg/services/role/` and `internal/pkg/services/user/`
- `internal/app/api/route/role/` and `internal/app/api/route/user/`
- `internal/pkg/testutil/testschema.go`

### Frontend: `C:\Users\kuon\code\manga-go-fe`

Create:

- `vitest.config.ts`, `src/test/setup.ts`, `src/test/render.tsx`
- `src/lib/authorization.ts`, `src/lib/authorization.test.ts`, `src/lib/authorization-errors.ts`
- `src/hooks/use-authorization.ts`, `src/hooks/use-admin-authorization.ts`, `src/hooks/use-debounced-value.ts`
- `src/components/auth/authorization-provider.tsx`, `src/components/auth/authorization-gate.tsx`
- `src/components/admin/access/access-tabs.tsx`, `access-pagination.tsx`, `access-state.tsx`
- `src/components/admin/access/user-access-table.tsx`, `user-role-sheet.tsx`, and colocated tests
- `src/components/admin/access/role-permission-workspace.tsx`, `permission-matrix.tsx`, `role-editor-dialog.tsx`, `role-delete-dialog.tsx`, and colocated tests
- `src/components/admin/access/audit-log-table.tsx`, `audit-log-filters.tsx`, `audit-log-sheet.tsx`, and colocated tests
- `src/app/(main)/admin/access/layout.tsx`, `page.tsx`, `users/page.tsx`, `roles/page.tsx`, `audit/page.tsx`
- `src/mocks/handlers/authorization.ts`

Modify:

- `package.json`, `yarn.lock`
- `src/types/rbac.ts`, `src/types/auth.ts`, `src/types/index.ts`
- `src/lib/api-client.ts`, `src/lib/query-keys.ts`
- `src/stores/auth-store.ts`
- `src/hooks/use-permission.ts`
- `src/components/providers/providers.tsx`
- `src/components/auth/permission-gate.tsx`
- `src/components/layout/header.tsx`
- `src/components/admin/admin-nav.tsx`
- `src/app/(auth)/login/page.tsx`, `src/app/(auth)/register/page.tsx`
- `src/app/(main)/admin/layout.tsx`, `users/page.tsx`, `roles/page.tsx`
- `src/middleware.ts`, `src/mocks/handlers/index.ts`, `src/mocks/data.ts`
- `docs/swagger.yaml`, `MEMORY.md`, `CHANGELOG.md`, `.gitignore`

Delete after replacements are live:

- `src/components/providers/rbac-provider.tsx`
- `src/components/auth/roles-sync-provider.tsx`
- `src/components/providers/permission-gate.tsx`
- `src/components/admin/user-role-manager.tsx`
- `src/components/admin/role-manager.tsx`
- `src/components/admin/role-permissions-modal.tsx`
- `src/hooks/use-rbac.ts`

---

### Task 1: Backend persistence, catalog, and conflict response foundation

**Files:**

- Create: `migrations/20260807_100000_add_authorization_admin_support.sql`
- Create: `internal/pkg/model/authorization_audit_log.go`
- Create: `internal/pkg/model/authorization_cache_revision.go`
- Modify: `internal/pkg/model/role.go`
- Modify: `internal/pkg/authorization/constants.go`
- Modify: `internal/pkg/authorization/catalog.go`
- Modify: `internal/pkg/authorization/catalog_test.go`
- Modify: `internal/pkg/seeder/role/seeder.go`
- Modify: `internal/app/api/common/response/type.go`
- Modify: `internal/app/api/common/response/response.go`
- Create: `internal/app/api/common/response/response_test.go`
- Modify: `internal/pkg/testutil/testschema.go`

**Interfaces:**

- Produces: catalog permission `audit_log:read`.
- Produces: `response.ResultConflict(code string, message string) Result` and JSON field `code`.
- Produces: `model.AuthorizationAuditLog`, `model.AuthorizationCacheRevision`, and persisted `Role.Description`.

- [ ] **Step 1: Write failing catalog and conflict-response tests**

Add these assertions:

```go
func TestCatalogContainsAuditLogRead(t *testing.T) {
	definition, ok := LookupPermission("audit_log:read")
	if !ok {
		t.Fatal("expected audit_log:read in the catalog")
	}
	if definition.Object != ObjectAuditLog || definition.Action != ActionRead {
		t.Fatalf("unexpected definition: %#v", definition)
	}
}

func TestResultConflictCarriesStableCode(t *testing.T) {
	result := ResultConflict("ROLE_IN_USE", "role is assigned")
	if result.HttpStatus != http.StatusConflict || result.Code != "ROLE_IN_USE" {
		t.Fatalf("unexpected conflict result: %#v", result)
	}
}
```

- [ ] **Step 2: Run the focused tests and confirm they fail**

Run from `manga-go`:

```powershell
go test ./internal/pkg/authorization ./internal/app/api/common/response -count=1
```

Expected: FAIL because `ObjectAuditLog`, `Result.Code`, and `ResultConflict` do not exist.

- [ ] **Step 3: Add the migration and models**

Use this schema:

```sql
-- +migrate Up
ALTER TABLE roles ADD COLUMN description TEXT NULL;

CREATE TABLE authorization_cache_revisions (
    scope VARCHAR(128) PRIMARY KEY,
    version BIGINT NOT NULL DEFAULT 1,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO authorization_cache_revisions (scope, version) VALUES ('global', 1);

CREATE TABLE authorization_audit_logs (
    id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    actor_user_id uuid NULL,
    actor_name_snapshot VARCHAR(255) NOT NULL,
    actor_email_snapshot VARCHAR(255) NOT NULL,
    action VARCHAR(64) NOT NULL,
    target_type VARCHAR(32) NOT NULL,
    target_id uuid NOT NULL,
    target_name_snapshot VARCHAR(255) NOT NULL,
    before JSONB NOT NULL DEFAULT '{}'::jsonb,
    after JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_authorization_audit_logs_created_at ON authorization_audit_logs(created_at DESC);
CREATE INDEX idx_authorization_audit_logs_actor ON authorization_audit_logs(actor_user_id, created_at DESC);
CREATE INDEX idx_authorization_audit_logs_target ON authorization_audit_logs(target_type, target_id, created_at DESC);

-- +migrate Down
DROP TABLE IF EXISTS authorization_audit_logs;
DROP TABLE IF EXISTS authorization_cache_revisions;
ALTER TABLE roles DROP COLUMN IF EXISTS description;
```

Implement the models with existing JSON helpers:

```go
type AuthorizationAuditLog struct {
	ID                  uuid.UUID      `json:"id" gorm:"type:uuid;primaryKey;default:uuid_generate_v4()"`
	ActorUserID         *uuid.UUID     `json:"actorUserId" gorm:"column:actor_user_id"`
	ActorNameSnapshot   string         `json:"actorName" gorm:"column:actor_name_snapshot"`
	ActorEmailSnapshot  string         `json:"actorEmail" gorm:"column:actor_email_snapshot"`
	Action              string         `json:"action" gorm:"column:action"`
	TargetType          string         `json:"targetType" gorm:"column:target_type"`
	TargetID            uuid.UUID      `json:"targetId" gorm:"column:target_id"`
	TargetNameSnapshot  string         `json:"targetName" gorm:"column:target_name_snapshot"`
	Before              common.JSONMap `json:"before" gorm:"column:before;type:jsonb"`
	After               common.JSONMap `json:"after" gorm:"column:after;type:jsonb"`
	CreatedAt           time.Time      `json:"createdAt" gorm:"column:created_at"`
}

type AuthorizationCacheRevision struct {
	Scope     string    `json:"scope" gorm:"column:scope;primaryKey"`
	Version   uint64    `json:"version" gorm:"column:version"`
	UpdatedAt time.Time `json:"updatedAt" gorm:"column:updated_at"`
}
```

Add `Description *string` to `model.Role` and the matching test schema.

- [ ] **Step 4: Add the catalog object and stable conflict response**

Add `ObjectAuditLog Object = "audit_log"`, catalog it with `ActionRead`, and tag `PermissionDefinition.Contexts` as `json:"contexts"`.

Extend the response types without breaking `NewResult` callers:

```go
type Response struct {
	Message          string                 `json:"message"`
	Code             string                 `json:"code,omitempty"`
	Data             any                    `json:"data,omitempty"`
	Err              string                 `json:"error,omitempty"`
	ValidationErrors []ValidationFieldError `json:"validation_errors,omitempty"`
}

func ResultConflict(code string, message string) Result {
	result := NewResult(false, http.StatusConflict, message, nil, nil)
	result.Code = code
	return result
}
```

Add `Code string` to the existing `Result` struct. Copy `Result.Code` into `Response.Code` in `ResponseResult`. Add `audit_log:read` to the seeded admin permissions.

- [ ] **Step 5: Run focused and model tests**

```powershell
go test ./internal/pkg/authorization ./internal/app/api/common/response ./internal/pkg/model ./internal/pkg/seeder/... -count=1
```

Expected: PASS.

- [ ] **Step 6: Commit the backend foundation**

```powershell
git add migrations/20260807_100000_add_authorization_admin_support.sql internal/pkg/model internal/pkg/authorization internal/pkg/seeder/role internal/app/api/common/response internal/pkg/testutil/testschema.go
git commit -m "feat(authz): add admin authorization persistence"
```

---

### Task 2: Backend self-authorization profile and Redis cache

**Files:**

- Create: `internal/pkg/repo/authorization_revision/repo.go`
- Create: `internal/pkg/repo/authorization_revision/fx.go`
- Create: `internal/pkg/services/authorization_admin/service.go`
- Create: `internal/pkg/services/authorization_admin/types.go`
- Create: `internal/pkg/services/authorization_admin/cache.go`
- Create: `internal/pkg/services/authorization_admin/profile.go`
- Create: `internal/pkg/services/authorization_admin/profile_test.go`
- Create: `internal/pkg/services/authorization_admin/fx.go`
- Create: `internal/app/api/route/user/get_my_authorization.go`
- Modify: `internal/app/api/route/user/handler_validation_test.go`
- Modify: `internal/pkg/authorization/policy_manager.go`
- Test: `internal/pkg/authorization/policy_manager_test.go`
- Modify: `internal/pkg/repo/fx.go`
- Modify: `internal/pkg/services/fx.go`
- Modify: `internal/pkg/services/user/service.go`
- Modify: `internal/app/api/route/user/handle.go`
- Modify: `internal/app/api/route/user/route.go`

**Interfaces:**

- Produces: `AuthorizationProfile { UserID, Roles, Permissions, Version }`.
- Produces: `AuthorizationAdminService.GetProfile(ctx context.Context, userID uuid.UUID) (*AuthorizationProfile, error)`.
- Produces: authenticated `GET /users/me/authorization`.
- Produces: revision methods `Current`, `BumpGlobalTx`, and `BumpUserTx` for later mutation tasks.

- [ ] **Step 1: Write failing profile/cache tests**

Cover exact effective-permission semantics and cache fallback:

```go
func TestGetProfileExpandsManageIntoEffectiveCatalogNames(t *testing.T) {
	env := newAuthorizationAdminTestEnv(t)
	userID, roleID := env.seedUserAndRole("manager")
	env.mustAssign(userID, roleID, []string{"user:manage", "role:manage"})

	profile, err := env.service.GetProfile(context.Background(), userID)
	if err != nil {
		t.Fatal(err)
	}
	for _, name := range []string{"user:read", "user:write", "user:delete", "user:manage", "role:manage"} {
		if !slices.Contains(profile.Permissions, name) {
			t.Fatalf("expected %s in %v", name, profile.Permissions)
		}
	}
}

func TestGetProfileFallsBackWhenRedisIsUnavailable(t *testing.T) {
	env := newAuthorizationAdminTestEnv(t)
	env.cache.getErr = errors.New("redis unavailable")
	userID, _ := env.seedUserAndRole("reader")

	profile, err := env.service.GetProfile(context.Background(), userID)
	if err != nil || profile.UserID != userID {
		t.Fatalf("expected live Casbin profile, got %#v, %v", profile, err)
	}
	if env.cache.setCalls != 0 {
		t.Fatal("must not write cache after a Redis read failure")
	}
}

```

Also add `TestGetProfileRequiresEveryExpandedWriteGrant`: create/update/publish together expose `comic:write`, while omitting any one action does not. Add `TestGetProfileReturnsLiveDataWhenRedisWriteFails`: configure a cache miss followed by a `Set` error and assert the live Casbin profile is returned without error. Test that a cache hit avoids recomputation and, for user `4d8ca2fe-740f-4b75-8776-6e827cb89540`, the key is `authorization:profile:g1:u1:user:4d8ca2fe-740f-4b75-8776-6e827cb89540`.

- [ ] **Step 2: Run the profile tests and confirm they fail**

```powershell
go test ./internal/pkg/services/authorization_admin ./internal/pkg/authorization -count=1
```

Expected: FAIL because the service, revisions, and effective catalog evaluator do not exist.

- [ ] **Step 3: Implement durable revision reads and profile cache adapter**

Expose these boundaries so unit tests use fakes without adding a Redis test dependency:

```go
type ProfileCache interface {
	Get(ctx context.Context, key string, target *AuthorizationProfile) (bool, error)
	Set(ctx context.Context, key string, profile *AuthorizationProfile, ttl time.Duration) error
	Delete(ctx context.Context, key string) error
}

type RevisionStore interface {
	Current(ctx context.Context, userID uuid.UUID) (global uint64, user uint64, err error)
	BumpGlobalTx(tx *gorm.DB) (uint64, error)
	BumpUserTx(tx *gorm.DB, userID uuid.UUID) (uint64, error)
}
```

`Current` creates a missing user-scoped row with version `1` using `ON CONFLICT DO NOTHING`, then returns both rows. Serialize profiles with `encoding/json` through `redis.Redis.Client()` and use `10*time.Minute` exactly. Log/measure Redis read or write errors; calculate live on a read error and still return live data on a write error.

- [ ] **Step 4: Implement effective profile calculation**

For each catalog definition, enforce every expanded grant in `CtxAny`; include the catalog name only if all grants pass:

```go
func (s *Service) isEffective(ctx context.Context, subject string, definition authorization.PermissionDefinition) (bool, error) {
	for _, action := range definition.Grants {
		err := s.authorizer.Enforce(ctx, authorization.Request{
			Subject: subject,
			Org: authorization.OrgPlatform,
			Action: action,
			Object: definition.Object,
			Context: authorization.CtxAny,
		})
		if errors.Is(err, authorization.ErrForbidden) {
			return false, nil
		}
		if err != nil {
			return false, err
		}
	}
	return true, nil
}
```

Load platform role IDs through `PolicyManager.RolesForUser`, resolve metadata through `RoleRepo`, sort roles and permission names, and return the composite version `fmt.Sprintf("g%d:u%d", global, user)`. A forbidden grant means the catalog permission is absent; any other authorizer error fails the live calculation instead of silently under-authorizing the profile.

- [ ] **Step 5: Add the authenticated endpoint**

Add this route before parameterized user routes:

```go
rg.GET("/me/authorization", ur.userHandler.getMyAuthorization)
```

The handler reads `authorization.ViewerFromContext`, rejects an absent user with `401`, calls `AuthorizationAdminService.GetProfile`, and returns `response.ResultSuccess("Authorization profile retrieved successfully", profile)`.

- [ ] **Step 6: Run focused tests**

```powershell
go test ./internal/pkg/services/authorization_admin ./internal/pkg/authorization ./internal/app/api/route/user -count=1
```

Expected: PASS, including cache hit/miss/fallback and effective permission expansion.

- [ ] **Step 7: Commit the profile endpoint**

```powershell
git add internal/pkg/repo/authorization_revision internal/pkg/repo/fx.go internal/pkg/services/authorization_admin internal/pkg/services/fx.go internal/pkg/authorization/policy_manager.go internal/pkg/authorization/policy_manager_test.go internal/pkg/services/user/service.go internal/app/api/route/user
git commit -m "feat(authz): expose cached authorization profile"
```

---

### Task 3: Backend admin user and role read APIs

**Files:**

- Create: `internal/pkg/request/user/list_authorization_users.go`
- Create: `internal/pkg/repo/user/list_authorization_users.go`
- Create: `internal/pkg/services/authorization_admin/reads.go`
- Create: `internal/pkg/services/authorization_admin/reads_test.go`
- Create: `internal/app/api/route/user/get_users.go`
- Modify: `internal/app/api/route/user/handler_validation_test.go`
- Modify: `internal/pkg/repo/authorization_revision/repo.go`
- Modify: `internal/pkg/authorization/policy_manager.go`
- Test: `internal/pkg/authorization/policy_manager_test.go`
- Modify: `internal/pkg/services/user/service.go`
- Modify: `internal/app/api/route/user/handle.go`
- Modify: `internal/app/api/route/user/route.go`
- Modify: `internal/pkg/services/role/list_all.go`
- Modify: `internal/pkg/services/role/get.go`
- Test: `internal/pkg/services/role/permissions_test.go`

**Interfaces:**

- Produces: `GET /users?page&limit&search&role_id`, requiring `user:read`, with a per-user `authorizationVersion`.
- Produces: enriched `GET /roles/all` entries with `permissions`, `assignedUserCount`, and the current global `authorizationVersion`; `GET /roles/:id` returns the same shape.
- Produces: `PolicyManager.UsersForRole(roleID string, org Org) ([]string, error)`.

- [ ] **Step 1: Write failing read-model tests**

Test search, role filtering, embedded roles, and role counts:

```go
func TestListUsersSearchesNameAndEmailAndEmbedsRoles(t *testing.T) {
	env := newAuthorizationAdminTestEnv(t)
	maiID, translatorID := env.seedUserAndRoleNamed("Mai Tran", "mai@example.com", "translator")
	env.mustAddRolePolicy(maiID, translatorID)
	env.seedUserNamed("Other", "other@example.com")

	page, err := env.service.ListUsers(context.Background(), ListUsersInput{
		Page: 1, Limit: 20, Search: "mai@",
	})
	if err != nil || page.Total != 1 || page.Data[0].Roles[0].Name != "translator" {
		t.Fatalf("unexpected page: %#v, %v", page, err)
	}
}
```

Add role-list and role-detail tests asserting permission names, assigned count, and authorization version are returned together.

- [ ] **Step 2: Run and confirm failure**

```powershell
go test ./internal/pkg/services/authorization_admin ./internal/pkg/services/role ./internal/pkg/authorization -count=1
```

Expected: FAIL because the read models and `UsersForRole` are absent.

- [ ] **Step 3: Implement request and response types**

```go
type ListAuthorizationUsersRequest struct {
	common.Paging
	Search string     `form:"search" binding:"omitempty,max=255"`
	RoleID *uuid.UUID `form:"role_id"`
}

type PagedUsers struct {
	Data  []UserAccessSummary `json:"data"`
	Total int64               `json:"total"`
	Page  int                 `json:"page"`
	Limit int                 `json:"limit"`
}
```

`UserAccessSummary` includes an `AuthorizationVersion string` field with the JSON name `authorizationVersion`, formatted like `g12:u4`. The user repository applies `LOWER(name) LIKE ? OR LOWER(email) LIKE ?`, restricts IDs when `role_id` is present, orders by `created_at DESC`, and returns only non-deleted users. Resolve platform roles from the in-memory enforcer after the page query; this is not an HTTP/database N+1. Add `RevisionStore.CurrentMany` so revisions for the page are loaded in one query rather than one query per user.

- [ ] **Step 4: Expose the protected user-list route**

Register `GET /users` inside the authenticated group with:

```go
requireUserRead := authzmiddleware.Require(ur.authzMiddleware, authorization.ActionRead, authorization.ObjectUser)
rg.GET("", requireUserRead, ur.userHandler.getUsers)
```

Bind the query, call `ListUsers`, and return the `PagedUsers` object.

- [ ] **Step 5: Enrich role summaries**

For every active role, fetch its permission names and assigned subjects, returning:

```go
type RoleAccessSummary struct {
	ID                uuid.UUID `json:"id"`
	Name              string    `json:"name"`
	Description       *string   `json:"description"`
	Permissions       []string  `json:"permissions"`
	AssignedUserCount int       `json:"assignedUserCount"`
	AuthorizationVersion string `json:"authorizationVersion"`
}
```

The role version is the current global revision formatted like `g12` and is identical across one response. Sort roles by normalized name and permission names lexicographically.

- [ ] **Step 6: Run focused tests**

```powershell
go test ./internal/pkg/services/authorization_admin ./internal/pkg/services/role ./internal/pkg/authorization ./internal/app/api/route/user -count=1
```

Expected: PASS.

- [ ] **Step 7: Commit the read APIs**

```powershell
git add internal/pkg/request/user internal/pkg/repo/user internal/pkg/repo/authorization_revision internal/pkg/services/authorization_admin internal/pkg/services/user internal/pkg/services/role internal/pkg/authorization internal/app/api/route/user
git commit -m "feat(authz): add admin user and role reads"
```

---

### Task 4: Backend immutable audit query API

**Files:**

- Create: `internal/pkg/repo/authorization_audit/repo.go`
- Create: `internal/pkg/repo/authorization_audit/fx.go`
- Create: `internal/pkg/request/authorization/list_audit_logs.go`
- Create: `internal/pkg/services/authorization_admin/audit.go`
- Create: `internal/pkg/services/authorization_admin/audit_test.go`
- Create: `internal/app/api/route/authorization/handler.go`
- Create: `internal/app/api/route/authorization/get_audit_logs.go`
- Create: `internal/app/api/route/authorization/route.go`
- Create: `internal/app/api/route/authorization/fx.go`
- Create: `internal/app/api/route/authorization/handler_validation_test.go`
- Modify: `internal/pkg/repo/fx.go`
- Modify: `internal/app/api/route/fx.go`

**Interfaces:**

- Produces: `AuthorizationAuditRepo.AppendTx` and `List`.
- Produces: `GET /authorization/audit-logs` requiring `audit_log:read`.

- [ ] **Step 1: Write failing repository/service tests**

Seed three audit rows and assert case-insensitive actor name/email, action, target, and date filters, newest-first ordering, and pagination:

```go
page, err := service.ListAuditLogs(ctx, ListAuditInput{
	Page: 1, Limit: 20, Action: "user.roles_replaced", TargetType: "user",
})
if err != nil || page.Total != 1 || page.Data[0].Action != "user.roles_replaced" {
	t.Fatalf("unexpected audit page: %#v, %v", page, err)
}
```

- [ ] **Step 2: Run and confirm failure**

```powershell
go test ./internal/pkg/services/authorization_admin ./internal/pkg/repo/authorization_audit ./internal/app/api/route/authorization -count=1
```

Expected: FAIL because the repository and route do not exist.

- [ ] **Step 3: Implement append-only repository methods**

Expose only:

```go
func (r *Repo) AppendTx(tx *gorm.DB, entry *model.AuthorizationAuditLog) error
func (r *Repo) List(ctx context.Context, input ListInput) ([]*model.AuthorizationAuditLog, int64, error)
```

Do not add update/delete methods. Apply exact filters and `ORDER BY created_at DESC, id DESC`.

- [ ] **Step 4: Implement request binding and protected route**

The request accepts `page`, `limit`, `actor`, `action`, `target_type`, `target_id`, `start_at`, and `end_at`. `actor` performs a case-insensitive contains match over the immutable actor name/email snapshots, so audit-only operators do not need `user:read`. Reject `start_at > end_at` with `400`. Register:

```go
requireAuditRead := authzmiddleware.Require(r.authzMiddleware, authorization.ActionRead, authorization.ObjectAuditLog)
rg := r.Group("/authorization", r.authMiddleware.RequireJwt)
rg.GET("/audit-logs", requireAuditRead, r.handler.getAuditLogs)
```

- [ ] **Step 5: Run focused tests**

```powershell
go test ./internal/pkg/services/authorization_admin ./internal/pkg/repo/authorization_audit ./internal/app/api/route/authorization -count=1
```

Expected: PASS.

- [ ] **Step 6: Commit the audit read path**

```powershell
git add internal/pkg/repo/authorization_audit internal/pkg/repo/fx.go internal/pkg/request/authorization internal/pkg/services/authorization_admin internal/app/api/route/authorization internal/app/api/route/fx.go
git commit -m "feat(authz): add authorization audit reads"
```

---

### Task 5: Safe user-role and role-permission replacement

**Files:**

- Create: `internal/pkg/services/authorization_admin/lock.go`
- Create: `internal/pkg/services/authorization_admin/mutations.go`
- Create: `internal/pkg/services/authorization_admin/mutations_test.go`
- Modify: `internal/pkg/services/authorization_admin/service.go`
- Modify: `internal/pkg/request/user/assign_role.go`
- Modify: `internal/pkg/request/role/assign_permission.go`
- Modify: `internal/pkg/services/user/assign_role.go`
- Modify: `internal/pkg/services/user/remove_role.go`
- Modify: `internal/pkg/services/role/assign_permission.go`
- Modify: `internal/pkg/services/role/remove_permission.go`
- Modify: `internal/pkg/authorization/policy_manager.go`
- Test: `internal/pkg/authorization/policy_manager_test.go`
- Modify: `internal/pkg/services/user/service.go`
- Modify: `internal/pkg/services/role/service.go`
- Modify: `internal/app/api/route/user/assign_user_role.go`
- Modify: `internal/app/api/route/user/remove_user_role.go`
- Test: `internal/app/api/route/user/handler_validation_test.go`
- Modify: `internal/app/api/route/role/assign_role_permission.go`
- Modify: `internal/app/api/route/role/remove_role_permission.go`
- Test: `internal/app/api/route/role/handler_validation_test.go`
- Test: `internal/pkg/services/user/roles_test.go`
- Test: `internal/pkg/services/role/permissions_test.go`

**Interfaces:**

- Produces: `ReplaceUserRoles(ctx, userID, roleIDs, expectedVersion)` and `ReplaceRolePermissions(ctx, roleID, permissions, expectedVersion)`.
- Consumes: profile revision store, audit append repository, Casbin policy manager, actor from request context.
- Preserves: legacy single-remove endpoints by routing them through complete-set replacement.

- [ ] **Step 1: Write failing safety, audit, and empty-set tests**

Cover these named cases:

```go
func TestReplaceUserRolesAcceptsEmptySet(t *testing.T)
func TestReplaceRolePermissionsAcceptsEmptySet(t *testing.T)
func TestReplaceUserRolesRejectsSelfLockout(t *testing.T)
func TestReplaceRolePermissionsRejectsLastRoleManager(t *testing.T)
func TestReplacementRejectsStaleAuthorizationVersion(t *testing.T)
func TestSuccessfulReplacementWritesBeforeAfterAuditAndBumpsRevision(t *testing.T)
func TestAuditFailureRestoresPreviousCasbinPolicy(t *testing.T)
```

For conflicts, assert both status and code:

```go
if result.HttpStatus != http.StatusConflict || result.Code != "SELF_MANAGE_REQUIRED" {
	t.Fatalf("unexpected result: %#v", result)
}
```

- [ ] **Step 2: Run and confirm failure**

```powershell
go test ./internal/pkg/services/authorization_admin ./internal/pkg/services/user ./internal/pkg/services/role ./internal/app/api/route/user ./internal/app/api/route/role -count=1
```

Expected: FAIL because replacement coordination and stable conflicts are absent.

- [ ] **Step 3: Make empty arrays distinguishable from missing fields**

Use pointer-to-slice request fields:

```go
type AssignRoleRequest struct {
	RoleIDs *[]uuid.UUID `json:"role_ids" binding:"required"`
}

type AssignPermissionRequest struct {
	Permissions *[]string `json:"permissions" binding:"required,dive,required"`
}
```

Handlers pass the dereferenced slice plus the optional `If-Match` header. `{ "role_ids": [] }` and `{ "permissions": [] }` are valid; a missing key is invalid. FE always sends `If-Match`; keeping it optional preserves existing API clients while still protecting the new admin workflow.

Update `PolicyManager.ReplaceRolesForUser` and `ReplacePermissionsForRole` to accept an empty replacement set and remove all current assignments/grants. Keep their subject/role/org validation and add direct policy-manager tests for both empty cases.

- [ ] **Step 4: Implement serialized mutation coordination**

Add a `MutationLocker` abstraction with a PostgreSQL advisory-lock implementation and a mutex fake for tests:

```go
const authorizationMutationLockKey int64 = 0x415554485A

type MutationLocker interface {
	WithLock(ctx context.Context, fn func() response.Result) response.Result
}
```

The PostgreSQL implementation obtains one dedicated `*sql.Conn`, executes `SELECT pg_advisory_lock($1)` with `authorizationMutationLockKey`, invokes `fn`, and always executes `SELECT pg_advisory_unlock($1)` on the same connection before closing it. The session lock therefore spans the Casbin write, postcondition checks, database commit, and any policy restoration across all application instances. The mutex fake provides the same serialized callback contract without PostgreSQL-only SQL.

Every replacement performs this order while locked:

1. Resolve the actor from context and capture current IDs/names.
2. Read the durable version (`gN:uN` for a user, `gN` for a role) and, when `If-Match` was supplied, return `409 AUTHORIZATION_STATE_CHANGED` before writing if it differs.
3. Validate every submitted role ID or permission name before writing.
4. Replace the Casbin set.
5. Verify the actor still has effective `role:manage` when changing their own access.
6. Verify at least one platform subject still has effective `role:manage`.
7. In one DB transaction append the audit entry and bump the target user's revision for role replacement or the global revision for permission replacement, then commit it before returning success.
8. If steps 5–7 or the database commit fail, restore the captured Casbin set before releasing the advisory lock.
9. Best-effort delete the old Redis profile key after commit.

Return the updated user or role summary, including its new authorization version, so the next staged mutation can use a fresh precondition.

Audit snapshots are deterministic: user-role snapshots use sorted `{id, name}` objects, and role-permission snapshots use lexicographically sorted permission-name arrays. The target snapshot is the user's current name/email or the role's current name as appropriate.

- [ ] **Step 5: Route legacy remove operations through replacement**

`RemoveRole` reads the current set, removes one ID, then calls `ReplaceUserRoles`. `RemovePermission` does the same through `ReplaceRolePermissions`. This prevents old endpoints from bypassing audit and lockout checks.

- [ ] **Step 6: Run focused and race tests**

```powershell
go test ./internal/pkg/services/authorization_admin ./internal/pkg/services/user ./internal/pkg/services/role -count=1
go test ./internal/pkg/services/authorization_admin -race -count=1
```

Expected: PASS; concurrent last-manager mutations serialize and only one unsafe mutation can be rejected.

- [ ] **Step 7: Commit safe replacement mutations**

```powershell
git add internal/pkg/services/authorization_admin internal/pkg/request/user/assign_role.go internal/pkg/request/role/assign_permission.go internal/pkg/authorization/policy_manager.go internal/pkg/authorization/policy_manager_test.go internal/pkg/services/user internal/pkg/services/role internal/app/api/route/user internal/app/api/route/role
git commit -m "feat(authz): audit and guard authorization changes"
```

---

### Task 6: Audited role lifecycle and role-in-use protection

**Files:**

- Modify: `internal/pkg/request/role/create.go`
- Modify: `internal/pkg/request/role/update.go`
- Modify: `internal/pkg/services/authorization_admin/mutations.go`
- Test: `internal/pkg/services/authorization_admin/mutations_test.go`
- Modify: `internal/pkg/services/role/create.go`
- Modify: `internal/pkg/services/role/update.go`
- Modify: `internal/pkg/services/role/delete.go`
- Test: `internal/pkg/services/role/service_test.go`
- Modify: `internal/app/api/route/role/create_role.go`
- Modify: `internal/app/api/route/role/update_role.go`
- Modify: `internal/app/api/route/role/delete_role.go`

**Interfaces:**

- Produces: audited create/update/delete role operations with descriptions and optimistic version checks for update/delete.
- Produces: `ROLE_IN_USE` conflict and exact assigned user count.
- Invalidates: global authorization revision on metadata update/delete, not on creation.

- [ ] **Step 1: Write failing lifecycle tests**

Add tests proving:

- Create persists nullable description and writes `role.created`.
- Update writes name/description before/after and bumps global revision.
- Delete returns `ROLE_IN_USE` while any platform grouping references the role.
- Delete of an unused role soft-deletes metadata, removes Casbin grants, writes `role.deleted`, and bumps global revision.
- Update/delete with a stale `If-Match: gN` returns `AUTHORIZATION_STATE_CHANGED` without changing metadata or policy.
- Audit/database failure restores deleted role policies and metadata visibility.

- [ ] **Step 2: Run and confirm failure**

```powershell
go test ./internal/pkg/services/authorization_admin ./internal/pkg/services/role ./internal/app/api/route/role -count=1
```

Expected: FAIL because role metadata and audit coordination are incomplete.

- [ ] **Step 3: Extend request contracts**

```go
type CreateRoleRequest struct {
	Name        string  `json:"name" binding:"required,min=2,max=100"`
	Description *string `json:"description" binding:"omitempty,max=1000"`
}

type UpdateRoleRequest struct {
	Name        string  `json:"name" binding:"required,min=2,max=100"`
	Description *string `json:"description" binding:"omitempty,max=1000"`
}
```

Trim both values in the service and preserve `nil` versus empty description consistently.

Use `{name, description}` for role metadata before/after snapshots. `role.created` has an empty before object, and `role.deleted` has an empty after object; permission arrays remain in the separate `role.permissions_replaced` event.

- [ ] **Step 4: Delegate role writes to the authorization admin service**

Handlers pass the optional `If-Match` header into the coordinator for update/delete; create does not need a precondition. The coordinator checks the durable global version while holding the same mutation lock used in Task 5. Keep the public `RoleService` methods as thin coordinator delegates. Deletion checks `UsersForRole` before any write and returns:

```go
return response.ResultConflict("ROLE_IN_USE", fmt.Sprintf("role is assigned to %d user(s)", len(userIDs)))
```

Update handlers and Swagger comments to document `409` and `code`.

- [ ] **Step 5: Run focused tests**

```powershell
go test ./internal/pkg/services/authorization_admin ./internal/pkg/services/role ./internal/app/api/route/role -count=1
```

Expected: PASS.

- [ ] **Step 6: Run the complete backend suite before moving to FE**

```powershell
go test ./... -count=1
```

Expected: PASS. If unrelated dirty backend files fail, record the exact failure without modifying `cmd/seed/main.go` or `internal/pkg/gorm/gorm.go`.

- [ ] **Step 7: Commit role lifecycle support**

```powershell
git add internal/pkg/request/role internal/pkg/services/authorization_admin internal/pkg/services/role internal/app/api/route/role
git commit -m "feat(authz): manage audited role lifecycle"
```

---

### Task 7: Frontend test harness, contracts, and pure authorization helpers

**Files:**

- Modify: `package.json`
- Modify: `yarn.lock`
- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`
- Create: `src/test/render.tsx`
- Modify: `src/types/rbac.ts`
- Modify: `src/types/auth.ts`
- Modify: `src/types/index.ts`
- Modify: `src/lib/api-client.ts`
- Modify: `src/lib/query-keys.ts`
- Create: `src/lib/authorization.ts`
- Create: `src/lib/authorization.test.ts`
- Create: `src/lib/authorization-errors.ts`
- Create: `src/mocks/handlers/authorization.ts`
- Modify: `src/mocks/handlers/index.ts`
- Modify: `src/mocks/data.ts`

**Interfaces:**

- Produces: strict FE types matching all backend contracts.
- Produces: API client methods for profile/users/roles/catalog/audit/mutations.
- Produces: pure `hasAuthorization`, `unionPermissions`, `diffPermissions`, and `groupPermissionCatalog` helpers.
- Produces: repeatable Vitest/RTL render harness.

- [ ] **Step 1: Install the approved test dependencies and add scripts**

Run from `manga-go-fe`:

```powershell
yarn.cmd add -D vitest @vitejs/plugin-react @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom
```

Add scripts:

```json
{
  "test": "vitest run",
  "test:watch": "vitest"
}
```

- [ ] **Step 2: Add Vitest configuration and setup**

```ts
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: true,
  },
});
```

`setup.ts` imports `@testing-library/jest-dom/vitest`, calls RTL cleanup after each test, and supplies typed `ResizeObserver`/`matchMedia` stubs. `render.tsx` creates a fresh `QueryClient` with retries disabled.

- [ ] **Step 3: Write failing helper tests**

```ts
it('requires every allOf permission and at least one anyOf permission', () => {
  const profile = profileWith(['role:manage', 'permission:read']);
  expect(hasAuthorization(profile, { allOf: ['role:manage', 'permission:read'] })).toBe(true);
  expect(hasAuthorization(profile, { allOf: ['role:manage', 'audit_log:read'] })).toBe(false);
  expect(hasAuthorization(profile, { anyOf: ['audit_log:read', 'role:manage'] })).toBe(true);
});

it('computes deterministic additions and removals', () => {
  expect(diffPermissions(['comic:read'], ['comic:write'])).toEqual({
    added: ['comic:write'],
    removed: ['comic:read'],
  });
});
```

- [ ] **Step 4: Replace stale RBAC types and API methods**

Use these core types:

```ts
export interface PermissionDefinition {
  name: string;
  object: string;
  action: string;
  grants: string[];
  contexts: string[];
}

export interface RoleAccessSummary {
  id: string;
  name: string;
  description: string | null;
  permissions: string[];
  assignedUserCount: number;
  authorizationVersion: string;
}

export interface AuthorizationProfile {
  userId: string;
  roles: Array<Pick<RoleAccessSummary, 'id' | 'name' | 'description'>>;
  permissions: string[];
  version: string;
}
```

Add `AdminUserSummary` (including `authorizationVersion`), `AuthorizationAuditLog`, `PagedAdminResult<T>`, filters, and payloads `{ permissions: string[] }` / `{ role_ids: string[] }`. Make legacy `User.role` optional because the backend user model does not return it.

Update `ApiClientError` to retain `code?: string`, parse response `code`, replace `/permissions/all` with `/permissions`, and add methods named `getMyAuthorization`, `getAuthorizationUsers`, `getAuthorizationRoles`, `getAuthorizationAuditLogs`, `replaceUserRoles`, `replaceRolePermissions`, `createRole`, `updateRole`, and `deleteRole`. Mutation methods other than create accept an `expectedVersion` argument and send it as `If-Match`.

- [ ] **Step 5: Implement pure helpers and stable error messages**

`authorization-errors.ts` maps `ROLE_IN_USE`, `SELF_MANAGE_REQUIRED`, `LAST_ROLE_MANAGER`, and `AUTHORIZATION_STATE_CHANGED` to specific Vietnamese guidance. Unknown conflicts use the backend message. `groupPermissionCatalog` sorts object groups and action columns deterministically without hardcoded resource rows.

- [ ] **Step 6: Add MSW contract handlers**

Mock the self profile, paged users, roles, catalog, audit page, and replacement mutations using the exact envelopes. Include one `409 ROLE_IN_USE` case for a role whose ID is `role-in-use`.

- [ ] **Step 7: Run tests and type-check the new files**

```powershell
yarn.cmd test src/lib/authorization.test.ts
.\node_modules\.bin\tsc.cmd --noEmit --pretty false
```

Expected: helper tests PASS. TypeScript may still report the recorded unrelated baseline errors, but must report no error in `src/types/rbac.ts`, `src/lib/api-client.ts`, `src/lib/query-keys.ts`, or `src/lib/authorization.ts`.

- [ ] **Step 8: Commit FE contracts and harness**

```powershell
git add package.json yarn.lock vitest.config.ts src/test src/types src/lib/api-client.ts src/lib/query-keys.ts src/lib/authorization.ts src/lib/authorization.test.ts src/lib/authorization-errors.ts src/mocks
git commit -m "test(authz): add frontend authorization contracts"
```

---

### Task 8: Frontend authorization provider, permission gates, and admin shell

**Files:**

- Create: `src/hooks/use-authorization.ts`
- Create: `src/components/auth/authorization-provider.tsx`
- Create: `src/components/auth/authorization-gate.tsx`
- Create: `src/components/auth/authorization-gate.test.tsx`
- Create: `src/components/admin/access/access-tabs.tsx`
- Create: `src/components/admin/access/access-state.tsx`
- Create: `src/app/(main)/admin/access/layout.tsx`
- Create: `src/app/(main)/admin/access/page.tsx`
- Modify: `src/components/providers/providers.tsx`
- Modify: `src/components/auth/permission-gate.tsx`
- Modify: `src/hooks/use-permission.ts`
- Modify: `src/components/layout/header.tsx`
- Modify: `src/components/admin/admin-nav.tsx`
- Modify: `src/app/(main)/admin/layout.tsx`
- Modify: `src/app/(main)/admin/users/page.tsx`
- Modify: `src/app/(main)/admin/roles/page.tsx`
- Modify: `src/app/(auth)/login/page.tsx`
- Modify: `src/app/(auth)/register/page.tsx`
- Modify: `src/stores/auth-store.ts`
- Modify: `src/middleware.ts`
- Delete: `src/components/providers/rbac-provider.tsx`
- Delete: `src/components/auth/roles-sync-provider.tsx`
- Delete: `src/components/providers/permission-gate.tsx`

**Interfaces:**

- Produces: `useAuthorization()` with query state and exact permission predicates.
- Produces: `<AuthorizationGate allOf? anyOf? loading? fallback?>`.
- Produces: one admin sidebar item and three permission-aware access tabs.
- Preserves: legacy semantic `PermissionGate` for non-admin product features, sourced from profile role names rather than Zustand.

- [ ] **Step 1: Write failing gate tests**

Test loading without denial flash, profile-error Retry, all-of, any-of, denied fallback, and profile `401` using the existing authentication-expiry flow:

```tsx
renderWithQuery(
  <AuthorizationGate allOf={['role:manage', 'permission:read']} fallback={<p>Denied</p>}>
    <p>Allowed</p>
  </AuthorizationGate>,
  { authorizationProfile: profileWith(['role:manage', 'permission:read']) }
);
expect(screen.getByText('Allowed')).toBeInTheDocument();
expect(screen.queryByText('Denied')).not.toBeInTheDocument();
```

- [ ] **Step 2: Run and confirm failure**

```powershell
yarn.cmd test src/components/auth/authorization-gate.test.tsx
```

Expected: FAIL because the hook/provider/gate do not exist.

- [ ] **Step 3: Implement the self-profile query**

```ts
export function useAuthorizationProfile() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return useQuery({
    queryKey: queryKeys.authorization.me(),
    queryFn: () => apiClient.getMyAuthorization(),
    enabled: isAuthenticated,
    staleTime: 30_000,
    refetchInterval: () => (document.visibilityState === 'visible' ? 60_000 : false),
    refetchOnWindowFocus: true,
  });
}
```

`AuthorizationProvider` mounts this query under `QueryProvider`. The gate uses `hasAuthorization`, renders a shape-matched skeleton while loading, and never examines role names. A profile error renders the shared retry state instead of treating the user as definitively denied.

- [ ] **Step 4: Remove admin-only role fetches from auth flows**

Change login/register to `setAuth(user)` immediately after successful authentication. Remove `roles`, `setRoles`, and the second argument to `setAuth` from Zustand. Update the legacy semantic `usePermission` to read `useAuthorizationProfile().data?.roles` and retain `user.role` only as a compatibility fallback. Remove the `allowedRoles` prop from the surviving semantic `PermissionGate`; admin access uses only `AuthorizationGate` permission names.

- [ ] **Step 5: Make the admin shell permission-driven**

Use these exact capability sets:

```ts
export const ACCESS_TAB_PERMISSIONS = {
  users: ['user:read', 'role:manage'],
  roles: ['role:manage', 'permission:read'],
  audit: ['audit_log:read'],
} as const;

export const ADMIN_ENTRY_PERMISSIONS = [
  'user:read',
  'role:manage',
  'permission:read',
  'audit_log:read',
  'genre:write',
  'genre:delete',
] as const;
```

Header and parent admin layout use `anyOf={ADMIN_ENTRY_PERMISSIONS}`. `access/layout.tsx` renders only authorized tabs, and each tab page independently gates its exact `allOf` set so a copied deep link cannot render protected UI. `access/page.tsx` is a client redirector to users, roles, audit, or `/` in that priority. Old `/admin/users` and `/admin/roles` pages use Next `redirect()` to the new paths. Add `/admin` to `PROTECTED_PREFIXES` in middleware.

- [ ] **Step 6: Handle stale access after `403`**

Add one shared helper that invalidates `queryKeys.authorization.me()`, awaits refetch, then redirects to the first allowed tab and shows a toast. Guard against retry loops with one attempt per failed mutation/query.

Add a test where an admin query returns `403`: assert the helper refetches the profile once, redirects after the new profile removes the active tab, and does not replay the forbidden request.

- [ ] **Step 7: Run gate and auth-flow tests**

```powershell
yarn.cmd test src/components/auth/authorization-gate.test.tsx
```

Expected: PASS.

- [ ] **Step 8: Commit the permission-driven shell**

```powershell
git add src/hooks/use-authorization.ts src/components/auth src/components/providers src/components/layout/header.tsx src/components/admin/admin-nav.tsx "src/app/(main)/admin" "src/app/(auth)" src/stores/auth-store.ts src/middleware.ts
git commit -m "feat(authz): add permission-driven admin shell"
```

---

### Task 9: Frontend user-role management tab

**Files:**

- Create: `src/hooks/use-admin-authorization.ts`
- Create: `src/hooks/use-debounced-value.ts`
- Create: `src/components/admin/access/access-pagination.tsx`
- Create: `src/components/admin/access/user-access-table.tsx`
- Create: `src/components/admin/access/user-role-sheet.tsx`
- Create: `src/components/admin/access/user-role-sheet.test.tsx`
- Create: `src/app/(main)/admin/access/users/page.tsx`
- Delete: `src/components/admin/user-role-manager.tsx`
- Modify: `src/lib/query-keys.ts`

**Interfaces:**

- Consumes: paged users, enriched roles, replacement mutation, permission-diff helpers.
- Produces: search/filter/page UI and responsive user detail sheet.

- [ ] **Step 1: Write failing user-sheet tests**

Test multi-role initialization, union preview, staged edits, diff confirmation, `role:manage` warning, empty-role save, success invalidation, and preserved draft on `409`:

```tsx
await user.click(screen.getByRole('checkbox', { name: 'Moderator' }));
expect(screen.getByText('Quyền được thêm')).toBeInTheDocument();
expect(screen.queryByText('Đã lưu')).not.toBeInTheDocument();

await user.click(screen.getByRole('button', { name: 'Lưu role' }));
expect(screen.getByText('Xác nhận thay đổi quyền quản trị')).toBeInTheDocument();
```

- [ ] **Step 2: Run and confirm failure**

```powershell
yarn.cmd test src/components/admin/access/user-role-sheet.test.tsx
```

Expected: FAIL because the user table and sheet do not exist.

- [ ] **Step 3: Implement query hooks**

`useAuthorizationUsers(filters)` keys by page/limit/debounced search/role ID. `useAuthorizationRoles()` shares one role list between tabs. `useReplaceUserRoles()` sends `{ role_ids }` with the selected user's `authorizationVersion` as `If-Match`; on success it invalidates the user list and target-specific queries, and also invalidates `authorization.me` when `targetUserId === currentUserId`.

- [ ] **Step 4: Implement the table and pagination**

The table shows name, email, role badges, and an explicit “Chưa có role” state. Search debounces by 300ms. Changing search or role resets page to 1. Pagination buttons are disabled at boundaries and expose Vietnamese accessible labels. Use shape-matched skeleton rows and distinguish an empty system from filters with no matches; the latter offers Clear filters.

- [ ] **Step 5: Implement the responsive sheet**

Use the existing Radix `Sheet`: full width on mobile and `sm:max-w-lg` on desktop. Maintain `Set<string>` draft role IDs. Compute effective permission union from selected `RoleAccessSummary.permissions`. Save opens a confirmation dialog showing sorted added/removed roles and permissions; changes involving `role:manage` use the stronger warning copy.

Map `409` codes through `authorization-errors.ts`, keep the sheet and draft open, and provide Retry for network/`5xx` failures. For `AUTHORIZATION_STATE_CHANGED`, refetch the selected user, show the before/current/draft difference, and require a new confirmation rather than automatically replaying the stale mutation.

- [ ] **Step 6: Run focused tests**

```powershell
yarn.cmd test src/components/admin/access/user-role-sheet.test.tsx
```

Expected: PASS.

- [ ] **Step 7: Commit user-role management**

```powershell
git add src/hooks/use-admin-authorization.ts src/hooks/use-debounced-value.ts src/components/admin/access "src/app/(main)/admin/access/users" src/lib/query-keys.ts src/components/admin/user-role-manager.tsx
git commit -m "feat(authz): add admin user role management"
```

---

### Task 10: Frontend role-permission workspace

**Files:**

- Create: `src/components/admin/access/role-permission-workspace.tsx`
- Create: `src/components/admin/access/permission-matrix.tsx`
- Create: `src/components/admin/access/role-editor-dialog.tsx`
- Create: `src/components/admin/access/role-delete-dialog.tsx`
- Create: `src/components/admin/access/permission-matrix.test.tsx`
- Create: `src/app/(main)/admin/access/roles/page.tsx`
- Modify: `src/hooks/use-admin-authorization.ts`
- Delete: `src/components/admin/role-manager.tsx`
- Delete: `src/components/admin/role-permissions-modal.tsx`
- Delete: `src/hooks/use-rbac.ts`

**Interfaces:**

- Consumes: live permission catalog and enriched role summaries.
- Produces: desktop role rail, mobile role selector/native accordions, metadata editor, staged permission matrix, and guarded delete flow.

- [ ] **Step 1: Write failing matrix and deletion tests**

```tsx
expect(screen.getByRole('row', { name: /comic/i })).toBeInTheDocument();
expect(screen.getByRole('checkbox', { name: 'Truyện · Ghi' })).toBeChecked();
expect(screen.getByText('Tạo, cập nhật và xuất bản')).toBeInTheDocument();

await user.click(screen.getByRole('button', { name: 'Xóa role' }));
expect(screen.getByRole('button', { name: 'Xác nhận xóa' })).toBeDisabled();
await user.type(screen.getByLabelText('Nhập tên role để xác nhận'), 'translator');
expect(screen.getByRole('button', { name: 'Xác nhận xóa' })).toBeEnabled();
```

Also test `assignedUserCount > 0` disables deletion and displays the count.

- [ ] **Step 2: Run and confirm failure**

```powershell
yarn.cmd test src/components/admin/access/permission-matrix.test.tsx
```

Expected: FAIL because the workspace does not exist.

- [ ] **Step 3: Implement catalog-driven matrix behavior**

Group catalog definitions by `object`; use catalog names as checkbox values. Render columns in `read`, `write`, `delete`, `manage` order only when the catalog supplies them. “Ghi” uses a tooltip containing exactly “Tạo, cập nhật và xuất bản”. Use a desktop table and mobile `<details>` sections without adding a runtime dependency.

- [ ] **Step 4: Implement staged role editing**

The selected role initializes name, description, its `authorizationVersion`, and a `Set<string>` permission draft. Switching roles with dirty state requires discard confirmation. Save metadata first with the selected version; use the returned fresh version for permission replacement. If metadata succeeds and permission replacement fails, refetch the role and keep the permission draft visible with Retry.

Create uses name/description then selects the returned role. Delete requires exact case-sensitive role name, is locally blocked when `assignedUserCount > 0`, and still handles authoritative `ROLE_IN_USE` from BE. For `AUTHORIZATION_STATE_CHANGED`, refetch the role, show current versus draft metadata/permissions, and require a new confirmation. Never automatically replay a stale edit or delete.

When there are no roles, render a first-role creation action instead of an empty matrix. Query errors preserve the selected role/draft and use the shared icon/message/Retry state.

- [ ] **Step 5: Invalidate exact queries after success**

Role create/update/delete/permission mutations invalidate role summaries and selected role detail. Any mutation affecting a role's metadata or permissions also invalidates `authorization.me`, allowing an operator who changed their own role to lose or gain tabs immediately.

- [ ] **Step 6: Run focused tests**

```powershell
yarn.cmd test src/components/admin/access/permission-matrix.test.tsx
```

Expected: PASS.

- [ ] **Step 7: Commit the role workspace**

```powershell
git add src/components/admin/access "src/app/(main)/admin/access/roles" src/hooks/use-admin-authorization.ts src/components/admin/role-manager.tsx src/components/admin/role-permissions-modal.tsx src/hooks/use-rbac.ts
git commit -m "feat(authz): add role permission workspace"
```

---

### Task 11: Frontend authorization audit tab

**Files:**

- Create: `src/components/admin/access/audit-log-table.tsx`
- Create: `src/components/admin/access/audit-log-filters.tsx`
- Create: `src/components/admin/access/audit-log-sheet.tsx`
- Create: `src/components/admin/access/audit-log-table.test.tsx`
- Create: `src/app/(main)/admin/access/audit/page.tsx`
- Modify: `src/hooks/use-admin-authorization.ts`

**Interfaces:**

- Consumes: paged immutable audit endpoint.
- Produces: server-filtered table and read-only before/after details.

- [ ] **Step 1: Write failing audit UI tests**

Test filter serialization, page reset, newest-first rendering, localized action labels, and immutable detail UI:

```tsx
await user.selectOptions(screen.getByLabelText('Hành động'), 'user.roles_replaced');
expect(onFiltersChange).toHaveBeenCalledWith(
  expect.objectContaining({
    action: 'user.roles_replaced',
    page: 1,
  })
);

await user.click(screen.getByRole('button', { name: 'Xem chi tiết thay đổi' }));
expect(screen.getByText('Trước thay đổi')).toBeInTheDocument();
expect(screen.getByText('Sau thay đổi')).toBeInTheDocument();
expect(screen.queryByRole('button', { name: /xóa|sửa|xuất/i })).not.toBeInTheDocument();
```

- [ ] **Step 2: Run and confirm failure**

```powershell
yarn.cmd test src/components/admin/access/audit-log-table.test.tsx
```

Expected: FAIL because the audit components do not exist.

- [ ] **Step 3: Implement query/filter behavior**

Use URL search params for page, actor text, action, target type, target ID, start date, and end date so audit views are shareable. Send ISO timestamps to BE. Disable Apply and show inline validation when start is after end.

- [ ] **Step 4: Implement table and immutable details**

Render timestamp in local time, actor snapshot, localized action, target snapshot, and a compact summary. The details sheet displays sorted JSON object keys as label/value rows and represents missing `before` or `after` values with “Không có”. It exposes no mutation controls.

- [ ] **Step 5: Add loading, empty, error, and retry states**

Use shape-matched table skeletons, distinguish empty history from no filter results, and reuse `access-state.tsx` for icon/message/retry behavior.

- [ ] **Step 6: Run focused tests**

```powershell
yarn.cmd test src/components/admin/access/audit-log-table.test.tsx
```

Expected: PASS.

- [ ] **Step 7: Commit the audit tab**

```powershell
git add src/components/admin/access "src/app/(main)/admin/access/audit" src/hooks/use-admin-authorization.ts
git commit -m "feat(authz): add authorization audit history"
```

---

### Task 12: Contract documentation, cleanup, and end-to-end verification

**Files:**

- Modify: `C:\Users\kuon\code\manga-go-fe\docs\swagger.yaml`
- Modify: `C:\Users\kuon\code\manga-go-fe\MEMORY.md`
- Modify: `C:\Users\kuon\code\manga-go-fe\CHANGELOG.md`
- Modify: `C:\Users\kuon\code\manga-go-fe\.gitignore`
- Verify all backend/frontend files from Tasks 1–11.

**Interfaces:**

- Consumes: completed backend and frontend implementations.
- Produces: synchronized API documentation, no obsolete RBAC/admin implementation, and a recorded verification report.

- [ ] **Step 1: Remove obsolete symbols and confirm no stale contract remains**

Run:

```powershell
rg -n "permissions/all|permissionIds|allowedRoles|admin.*superadmin|RolesSyncProvider|RbacProvider|getUserRoles\(user\.id\)|components/providers/permission-gate" src
```

Expected: no matches in live admin/auth code. Matches in historical design documents are acceptable.

- [ ] **Step 2: Ignore visual companion artifacts**

Add exactly this root entry to `.gitignore`:

```gitignore
/.superpowers/
```

Do not stage the existing `.superpowers/` directory.

- [ ] **Step 3: Regenerate and synchronize Swagger**

From `manga-go`:

```powershell
make swagger
```

Copy the generated `swagger-docs/swagger.yaml` over `manga-go-fe/docs/swagger.yaml`, then verify the documented paths include `/users/me/authorization`, `/users`, and `/authorization/audit-logs` and that mutation bodies use permission names and `role_ids`.

- [ ] **Step 4: Run backend verification**

From `manga-go`:

```powershell
go test ./... -count=1
go test ./internal/pkg/services/authorization_admin -race -count=1
golangci-lint run ./...
```

Expected: PASS. Confirm `git status --short` still shows the user's pre-existing backend edits untouched.

- [ ] **Step 5: Run frontend automated verification**

From `manga-go-fe`:

```powershell
yarn.cmd test
yarn.cmd format:check
yarn.cmd lint
.\node_modules\.bin\tsc.cmd --noEmit
yarn.cmd build
```

Expected for feature-owned tests and formatting: PASS. `tsc`/build must report no authorization-feature errors. If the previously recorded unrelated baseline errors or restricted Google Font fetch remain, stop and request scope/environment resolution; do not mark the implementation complete.

- [ ] **Step 6: Perform two-session manual authorization checks**

Run BE and FE, then verify:

1. Session A changes Session B's roles; Session B loses revoked admin UI within 60 seconds or immediately on the next `403`.
2. A role-permission change makes the old Redis generation unreachable and updates both sessions without re-login.
3. An unassigned role can be deleted after exact-name confirmation; an assigned role returns the localized `ROLE_IN_USE` message.
4. Self-lockout and last-manager attempts return localized `409` warnings and leave state unchanged.
5. Every successful change appears in audit history with correct actor and before/after values.
6. Users, roles, and audit tabs work at 375px and 1280px in light and dark mode with keyboard-only navigation.

- [ ] **Step 7: Update project memory and changelog**

Record the new `/admin/access/*` information architecture, Casbin permission-driven gates, Redis/PostgreSQL revision strategy, audit model, new tests, and any unresolved baseline verification blocker. Do not rewrite unrelated history.

- [ ] **Step 8: Commit frontend integration and documentation**

From `manga-go-fe`:

```powershell
git add docs/swagger.yaml MEMORY.md CHANGELOG.md .gitignore
git commit -m "docs(authz): document admin authorization rollout"
```

- [ ] **Step 9: Record final repository state**

```powershell
git -C C:\Users\kuon\code\manga-go status --short
git -C C:\Users\kuon\code\manga-go-fe status --short
git -C C:\Users\kuon\code\manga-go log -8 --oneline
git -C C:\Users\kuon\code\manga-go-fe log -8 --oneline
```

Expected: only pre-existing user changes or explicitly documented verification artifacts remain unstaged. Report backend and frontend commit lists separately.
