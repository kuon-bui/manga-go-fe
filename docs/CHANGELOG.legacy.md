# Changelog (legacy)

> Archived. This is the changelog inherited from the Vibe-Coding Prompt Template this repo was
> scaffolded from, kept for historical reference only. The current changelog is `CHANGELOG.md`
> at the repo root and is generated automatically by
> [release-please](https://github.com/googleapis/release-please) from conventional commits — do
> not edit either file by hand.

All notable changes to the Vibe-Coding Prompt Template were documented in this file.

## [Unreleased] - August 2026 — Admin Authorization Management

### Added

- Permission-driven admin area at `/admin/access/*` for managing user roles, role metadata, role permissions, and read-only authorization audit history.
- Responsive user-role sheet, catalog-driven permission matrix, guarded role deletion, deep-linkable audit filters, and localized conflict handling.
- Cached self-authorization profile integration with scheduled refresh, focus refresh, and stale-access recovery after `403`.
- Vitest and React Testing Library coverage for authorization helpers, gates, mutation drafts/conflicts, role permissions, deletion safeguards, and audit history.

### Changed

- Admin navigation and route gates now use effective permission names from `GET /users/me/authorization`; role names are no longer used as authorization decisions.
- Role-permission mutations use catalog names, user-role replacement supports empty/multiple roles, and mutation requests carry optimistic `If-Match` versions.
- API documentation is synchronized with the generated backend Swagger, including `/users/me/authorization`, `/users`, `/authorization/audit-logs`, `role_ids`, and permission-name payloads.

### Removed

- Obsolete duplicate RBAC providers, role synchronization during login/register, and legacy admin role/permission management components.

## [Unreleased] - March 2026 — Agentic Era v2.0

This major update shifts the repository from "chat-based prompt generation" to **Artifact-First Memory** and **Multi-Agent Orchestration**, reflecting the massive tool updates from February and March 2026 (Cursor Cloud Agents, Claude Agent Teams, and Copilot custom agents).

### Added

- **Artifact-First Memory:** Introduced `MEMORY.md` and `spec.md` concepts to prevent context window overload during long coding sessions.
- **Claude Agent Teams Guide:** Added `docs/claude-agent-teams.md` covering parallel sub-agents and the Team Lead approval flow.
- **Cursor Cloud Agents Guide:** Added `docs/cursor-cloud-agents.md` focusing on dynamic context discovery and file-centric memory.
- **Visual README Loop:** A modernized `╭──╮` looping diagram for the Execute -> Verify workflow.

### Changed

- **README Redesign:** Overhauled the main README to use collapsibles `<details open>`, a table of contents, and a faster 5-step quick start.
- **Tool Matrix:** Updated the tool recommendation matrix to clearly separate prototype tools (Lovable) from production tools (v0), and highlighted multi-agent capabilities.
- **Part 4 Prompts (`part4-notes-for-agent.md`):** Replaced legacy prompt structures with 2026 Agentic Boilerplate conventions, including explicit blocked directories and strict TypeScript guidelines.

### Removed

- **MCP Support Guide:** Removed `mcp-support.md` as standard tools now natively handle context retrieval much better, shifting the focus to native plugin workflows and Agent Teams.
