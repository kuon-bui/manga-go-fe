'use client';

import { QueryProvider } from '@/components/providers/query-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { NotificationPollingProvider } from '@/components/providers/notification-polling-provider';
import { MSWProvider } from '@/components/providers/msw-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MSWProvider>
      <QueryProvider>
        <ThemeProvider>
          <NotificationPollingProvider />
          {children}
        </ThemeProvider>
      </QueryProvider>
    </MSWProvider>
  );
}
