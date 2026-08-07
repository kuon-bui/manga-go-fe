'use client';

import { QueryProvider } from '@/components/providers/query-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { AuthorizationProvider } from '@/components/auth/authorization-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <ThemeProvider>
        <AuthorizationProvider>{children}</AuthorizationProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}
