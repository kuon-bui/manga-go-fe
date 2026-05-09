'use client';

import { QueryProvider } from '@/components/providers/query-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';

import { RbacProvider } from '@/components/providers/rbac-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <ThemeProvider>
        <RbacProvider />
        {children}
      </ThemeProvider>
    </QueryProvider>
  );
}
