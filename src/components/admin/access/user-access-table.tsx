import { UserRoundSearch } from 'lucide-react';

import { AccessState } from '@/components/admin/access/access-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { AdminUserSummary } from '@/types/rbac';

interface UserAccessTableProps {
  users: AdminUserSummary[];
  loading: boolean;
  error: boolean;
  hasFilters: boolean;
  onRetry: () => void;
  onClearFilters: () => void;
  onSelect: (_user: AdminUserSummary) => void;
}

export function UserAccessTable({
  users,
  loading,
  error,
  hasFilters,
  onRetry,
  onClearFilters,
  onSelect,
}: UserAccessTableProps) {
  if (error) {
    return (
      <AccessState
        title="Không thể tải danh sách người dùng"
        message="Kiểm tra kết nối rồi thử lại."
        retry={onRetry}
      />
    );
  }

  if (!loading && users.length === 0) {
    return (
      <div className="flex min-h-56 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed p-6 text-center">
        <UserRoundSearch className="h-9 w-9 text-muted-foreground" aria-hidden="true" />
        <p className="font-semibold">
          {hasFilters ? 'Không có kết quả phù hợp' : 'Hệ thống chưa có user'}
        </p>
        {hasFilters ? (
          <Button type="button" variant="outline" onClick={onClearFilters}>
            Xóa bộ lọc
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Người dùng</TableHead>
          <TableHead className="hidden sm:table-cell">Role</TableHead>
          <TableHead className="w-28 text-right">Thao tác</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading
          ? Array.from({ length: 5 }, (_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="h-10 w-52" />
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Skeleton className="h-7 w-36" />
                </TableCell>
                <TableCell>
                  <Skeleton className="ml-auto h-8 w-20" />
                </TableCell>
              </TableRow>
            ))
          : users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  <div className="mt-2 flex flex-wrap gap-1 sm:hidden">
                    <RoleBadges user={user} />
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <div className="flex flex-wrap gap-1">
                    <RoleBadges user={user} />
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    aria-label={`Chỉnh role cho ${user.name}`}
                    onClick={() => onSelect(user)}
                  >
                    Chỉnh role
                  </Button>
                </TableCell>
              </TableRow>
            ))}
      </TableBody>
    </Table>
  );
}

function RoleBadges({ user }: { user: AdminUserSummary }) {
  if (user.roles.length === 0)
    return <span className="text-xs text-muted-foreground">Chưa có role</span>;
  return user.roles.map((role) => (
    <Badge key={role.id} variant="secondary">
      {role.name}
    </Badge>
  ));
}

export type { UserAccessTableProps };
