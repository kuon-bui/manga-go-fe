'use client';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import type { AuthorizationAuditLog } from '@/types/rbac';

interface AuditLogSheetProps {
  log: AuthorizationAuditLog | null;
  onOpenChange: (_open: boolean) => void;
}

export function AuditLogSheet({ log, onOpenChange }: AuditLogSheetProps) {
  return (
    <Sheet open={log !== null} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Chi tiết thay đổi phân quyền</SheetTitle>
          <SheetDescription>
            {log
              ? `${log.actorName || log.actorEmail} · ${new Date(log.createdAt).toLocaleString()}`
              : ''}
          </SheetDescription>
        </SheetHeader>
        {log ? (
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <Snapshot title="Trước thay đổi" value={log.before} />
            <Snapshot title="Sau thay đổi" value={log.after} />
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function Snapshot({ title, value }: { title: string; value: Record<string, unknown> }) {
  const entries = Object.entries(value).sort(([left], [right]) => left.localeCompare(right));
  return (
    <section className="space-y-3">
      <h3 className="font-semibold">{title}</h3>
      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">Không có</p>
      ) : (
        <dl className="space-y-2 rounded-xl border p-3">
          {entries.map(([key, entry]) => (
            <div key={key} className="space-y-1 border-b pb-2 last:border-0 last:pb-0">
              <dt className="text-xs font-semibold text-muted-foreground">{key}</dt>
              <dd className="break-words text-sm">{formatAuditValue(entry)}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}

function formatAuditValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return 'Không có';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return JSON.stringify(value, null, 2);
}

export type { AuditLogSheetProps };
