import type { AuthorizationProfile, PermissionDefinition, RoleAccessSummary } from '@/types/rbac';

export interface AuthorizationRequirement {
  allOf?: readonly string[];
  anyOf?: readonly string[];
}

export interface PermissionCatalogGroup {
  object: string;
  definitions: PermissionDefinition[];
  actions: string[];
}

const ACTION_ORDER = ['read', 'write', 'delete', 'manage'] as const;

export function hasAuthorization(
  profile: AuthorizationProfile | null | undefined,
  requirement: AuthorizationRequirement
): boolean {
  if (!profile) return false;

  const permissions = new Set(profile.permissions);
  const allAllowed = (requirement.allOf ?? []).every((name) => permissions.has(name));
  const anyOf = requirement.anyOf ?? [];
  const anyAllowed = anyOf.length === 0 || anyOf.some((name) => permissions.has(name));

  return allAllowed && anyAllowed;
}

export function unionPermissions(
  roles: ReadonlyArray<Pick<RoleAccessSummary, 'permissions'>>
): string[] {
  return [...new Set(roles.flatMap((role) => role.permissions))].sort();
}

export function diffPermissions(
  before: readonly string[],
  after: readonly string[]
): { added: string[]; removed: string[] } {
  const beforeSet = new Set(before);
  const afterSet = new Set(after);

  return {
    added: [...afterSet].filter((name) => !beforeSet.has(name)).sort(),
    removed: [...beforeSet].filter((name) => !afterSet.has(name)).sort(),
  };
}

export function groupPermissionCatalog(
  catalog: readonly PermissionDefinition[]
): PermissionCatalogGroup[] {
  const groups = new Map<string, PermissionDefinition[]>();
  for (const definition of catalog) {
    const definitions = groups.get(definition.object) ?? [];
    definitions.push(definition);
    groups.set(definition.object, definitions);
  }

  return [...groups.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([object, definitions]) => {
      const sortedDefinitions = [...definitions].sort(comparePermissionDefinitions);
      return {
        object,
        definitions: sortedDefinitions,
        actions: sortedDefinitions.map((definition) => definition.action),
      };
    });
}

function comparePermissionDefinitions(
  left: PermissionDefinition,
  right: PermissionDefinition
): number {
  const leftIndex = ACTION_ORDER.indexOf(left.action as (typeof ACTION_ORDER)[number]);
  const rightIndex = ACTION_ORDER.indexOf(right.action as (typeof ACTION_ORDER)[number]);
  const normalizedLeft = leftIndex === -1 ? ACTION_ORDER.length : leftIndex;
  const normalizedRight = rightIndex === -1 ? ACTION_ORDER.length : rightIndex;

  return normalizedLeft - normalizedRight || left.action.localeCompare(right.action);
}
