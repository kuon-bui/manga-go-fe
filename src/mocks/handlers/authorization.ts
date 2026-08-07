import { http, HttpResponse } from 'msw';

import {
  MOCK_AUTHORIZATION_AUDIT_LOGS,
  MOCK_AUTHORIZATION_PROFILE,
  MOCK_AUTHORIZATION_ROLES,
  MOCK_AUTHORIZATION_USERS,
  MOCK_PERMISSION_CATALOG,
} from '@/mocks/data';
import type {
  CreateRolePayload,
  ReplaceRolePermissionsPayload,
  ReplaceUserRolesPayload,
  UpdateRolePayload,
} from '@/types/rbac';

function envelope<T>(data: T, message = 'ok'): { data: T; message: string } {
  return { data, message };
}

export const authorizationHandlers = [
  http.get('*/users/me/authorization', () =>
    HttpResponse.json(envelope(MOCK_AUTHORIZATION_PROFILE))
  ),

  http.get('*/users/:userId/authorization', ({ params }) => {
    const user = MOCK_AUTHORIZATION_USERS.find((item) => item.id === params.userId);
    return user
      ? HttpResponse.json(envelope(user))
      : HttpResponse.json({ message: 'User not found' }, { status: 404 });
  }),

  http.get('*/users', ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get('search')?.toLocaleLowerCase() ?? '';
    const roleId = url.searchParams.get('role_id') ?? '';
    const page = Number(url.searchParams.get('page') ?? 1);
    const limit = Number(url.searchParams.get('limit') ?? 20);
    const filtered = MOCK_AUTHORIZATION_USERS.filter(
      (user) =>
        (!search || `${user.name} ${user.email}`.toLocaleLowerCase().includes(search)) &&
        (!roleId || user.roles.some((role) => role.id === roleId))
    );

    return HttpResponse.json(
      envelope({
        data: filtered.slice((page - 1) * limit, page * limit),
        total: filtered.length,
        page,
        limit,
      })
    );
  }),

  http.get('*/roles/all', () => HttpResponse.json(envelope(MOCK_AUTHORIZATION_ROLES))),
  http.get('*/permissions', () => HttpResponse.json(envelope(MOCK_PERMISSION_CATALOG))),

  http.get('*/authorization/audit-logs', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? 1);
    const limit = Number(url.searchParams.get('limit') ?? 20);
    return HttpResponse.json(
      envelope({
        data: MOCK_AUTHORIZATION_AUDIT_LOGS,
        total: MOCK_AUTHORIZATION_AUDIT_LOGS.length,
        page,
        limit,
      })
    );
  }),

  http.post('*/users/:userId/roles', async ({ params, request }) => {
    const payload = (await request.json()) as ReplaceUserRolesPayload;
    return HttpResponse.json(
      envelope({ roleIds: payload.role_ids, version: `g1:u2`, userId: String(params.userId) })
    );
  }),

  http.post('*/roles/:roleId/permissions', async ({ params, request }) => {
    const payload = (await request.json()) as ReplaceRolePermissionsPayload;
    const role = MOCK_AUTHORIZATION_ROLES.find((item) => item.id === params.roleId);
    return HttpResponse.json(
      envelope({
        ...(role ?? MOCK_AUTHORIZATION_ROLES[0]),
        permissions: payload.permissions,
        authorizationVersion: 'g2',
      })
    );
  }),

  http.post('*/roles', async ({ request }) => {
    const payload = (await request.json()) as CreateRolePayload;
    return HttpResponse.json(
      envelope({
        id: 'role-created',
        name: payload.name,
        description: payload.description ?? null,
      })
    );
  }),

  http.put('*/roles/:roleId', async ({ params, request }) => {
    const payload = (await request.json()) as UpdateRolePayload;
    const role = MOCK_AUTHORIZATION_ROLES.find((item) => item.id === params.roleId);
    return HttpResponse.json(
      envelope({
        ...(role ?? MOCK_AUTHORIZATION_ROLES[0]),
        id: String(params.roleId),
        name: payload.name,
        description: payload.description ?? null,
        authorizationVersion: 'g2',
      })
    );
  }),

  http.delete('*/roles/role-in-use', () =>
    HttpResponse.json(
      { code: 'ROLE_IN_USE', message: 'role is assigned to 2 user(s)' },
      { status: 409 }
    )
  ),

  http.delete('*/roles/:roleId', () => HttpResponse.json(envelope(null))),
];
