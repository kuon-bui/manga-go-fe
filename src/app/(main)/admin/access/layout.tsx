import type { ReactNode } from 'react';

import { AccessTabs } from '@/components/admin/access/access-tabs';

export default function AccessLayout({ children }: { children: ReactNode }) {
  return (
    <section>
      <header className="space-y-1 px-4 pb-2 pt-5 sm:px-5">
        <h1 className="font-display text-2xl font-bold">Phân quyền hệ thống</h1>
        <p className="text-sm text-muted-foreground">
          Quản lý user, role, quyền và lịch sử thay đổi.
        </p>
      </header>
      <AccessTabs />
      <div className="animate-in fade-in slide-in-from-bottom-4 p-4 duration-300 sm:p-5">
        {children}
      </div>
    </section>
  );
}
