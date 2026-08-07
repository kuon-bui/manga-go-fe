import { ACCESS_TAB_PERMISSIONS } from '@/components/admin/access/access-tabs';
import { RolePermissionWorkspace } from '@/components/admin/access/role-permission-workspace';
import { AuthorizationGate } from '@/components/auth/authorization-gate';

export default function AdminAccessRolesPage() {
  return (
    <AuthorizationGate allOf={ACCESS_TAB_PERMISSIONS.roles}>
      <RolePermissionWorkspace />
    </AuthorizationGate>
  );
}
