'use client';

import { QueryProvider } from '@/components/providers/query-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { NotificationPollingProvider } from '@/components/providers/notification-polling-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <ThemeProvider>
        <NotificationPollingProvider />
        {children}
      </ThemeProvider>
    </QueryProvider>
  );
}
