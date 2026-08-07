'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { groupPermissionCatalog } from '@/lib/authorization';
import type { PermissionDefinition } from '@/types/rbac';

interface PermissionMatrixProps {
  catalog: PermissionDefinition[];
  selected: ReadonlySet<string>;
  onChange: (_permission: string, _checked: boolean) => void;
}

const ACTION_ORDER = ['read', 'write', 'delete', 'manage'];
const ACTION_LABELS: Readonly<Record<string, string>> = {
  read: 'Đọc',
  write: 'Ghi',
  delete: 'Xóa',
  manage: 'Quản lý',
};
const OBJECT_LABELS: Readonly<Record<string, string>> = {
  audit_log: 'Nhật ký phân quyền',
  author: 'Tác giả',
  chapter: 'Chương',
  comic: 'Truyện',
  comment: 'Bình luận',
  file: 'Tệp',
  genre: 'Thể loại',
  notification: 'Thông báo',
  page: 'Trang truyện',
  permission: 'Quyền',
  rating: 'Đánh giá',
  reading_history: 'Lịch sử đọc',
  role: 'Role',
  tag: 'Tag',
  translation_group: 'Nhóm dịch',
  user: 'Người dùng',
};

export function PermissionMatrix({ catalog, selected, onChange }: PermissionMatrixProps) {
  const groups = groupPermissionCatalog(catalog);
  const actions = [...new Set(catalog.map((item) => item.action))].sort(
    (left, right) => ACTION_ORDER.indexOf(left) - ACTION_ORDER.indexOf(right)
  );

  return (
    <div className="space-y-3">
      {actions.includes('write') ? (
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold">Ghi:</span> Tạo, cập nhật và xuất bản
        </p>
      ) : null}

      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tài nguyên</TableHead>
              {actions.map((action) => (
                <TableHead key={action}>{actionLabel(action)}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {groups.map((group) => (
              <TableRow key={group.object}>
                <TableHead scope="row" className="text-foreground">
                  {objectLabel(group.object)}
                </TableHead>
                {actions.map((action) => {
                  const definition = group.definitions.find((item) => item.action === action);
                  return (
                    <TableCell key={action}>
                      {definition ? (
                        <Checkbox
                          aria-label={`${objectLabel(group.object)} · ${actionLabel(action)}`}
                          checked={selected.has(definition.name)}
                          onCheckedChange={(checked) => onChange(definition.name, checked === true)}
                        />
                      ) : (
                        <span className="text-muted-foreground" aria-hidden="true">
                          —
                        </span>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-2 md:hidden">
        {groups.map((group) => (
          <details key={group.object} className="rounded-xl border p-3">
            <summary className="cursor-pointer font-semibold">{objectLabel(group.object)}</summary>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {group.definitions.map((definition) => {
                const id = `mobile-permission-${definition.name}`;
                return (
                  <div key={definition.name} className="flex items-center gap-2">
                    <Checkbox
                      id={id}
                      aria-label={`${objectLabel(group.object)} · ${actionLabel(definition.action)} (di động)`}
                      checked={selected.has(definition.name)}
                      onCheckedChange={(checked) => onChange(definition.name, checked === true)}
                    />
                    <Label htmlFor={id}>{actionLabel(definition.action)}</Label>
                  </div>
                );
              })}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

function actionLabel(action: string): string {
  return ACTION_LABELS[action] ?? action;
}

function objectLabel(object: string): string {
  return OBJECT_LABELS[object] ?? object;
}

export type { PermissionMatrixProps };
