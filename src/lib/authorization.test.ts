import {
  diffPermissions,
  groupPermissionCatalog,
  hasAuthorization,
  unionPermissions,
} from '@/lib/authorization';
import type { AuthorizationProfile, PermissionDefinition, RoleAccessSummary } from '@/types/rbac';
import { describe, expect, it } from 'vitest';

function profileWith(permissions: string[]): AuthorizationProfile {
  return {
    userId: 'user-1',
    roles: [],
    permissions,
    version: 'g1:u1',
  };
}

describe('authorization helpers', () => {
  it('requires every allOf permission and at least one anyOf permission', () => {
    const profile = profileWith(['role:manage', 'permission:read']);

    expect(hasAuthorization(profile, { allOf: ['role:manage', 'permission:read'] })).toBe(true);
    expect(hasAuthorization(profile, { allOf: ['role:manage', 'audit_log:read'] })).toBe(false);
    expect(hasAuthorization(profile, { anyOf: ['audit_log:read', 'role:manage'] })).toBe(true);
    expect(
      hasAuthorization(profile, {
        allOf: ['permission:read'],
        anyOf: ['audit_log:read', 'role:manage'],
      })
    ).toBe(true);
  });

  it('computes deterministic additions and removals', () => {
    expect(diffPermissions(['comic:read'], ['comic:write'])).toEqual({
      added: ['comic:write'],
      removed: ['comic:read'],
    });
  });

  it('unions role permissions without duplicates', () => {
    const roles = [
      { permissions: ['comic:write', 'comic:read'] },
      { permissions: ['comic:read', 'role:manage'] },
    ] as RoleAccessSummary[];

    expect(unionPermissions(roles)).toEqual(['comic:read', 'comic:write', 'role:manage']);
  });

  it('groups catalog rows and action columns deterministically', () => {
    const catalog: PermissionDefinition[] = [
      {
        name: 'user:manage',
        object: 'user',
        action: 'manage',
        grants: ['manage'],
        contexts: ['any'],
      },
      {
        name: 'comic:write',
        object: 'comic',
        action: 'write',
        grants: ['create', 'update'],
        contexts: ['any'],
      },
      { name: 'comic:read', object: 'comic', action: 'read', grants: ['read'], contexts: ['any'] },
    ];

    expect(groupPermissionCatalog(catalog)).toEqual([
      {
        object: 'comic',
        definitions: [catalog[2], catalog[1]],
        actions: ['read', 'write'],
      },
      {
        object: 'user',
        definitions: [catalog[0]],
        actions: ['manage'],
      },
    ]);
  });
});
