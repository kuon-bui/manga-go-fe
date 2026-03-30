'use client';

import type { ReactNode } from 'react';

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Root providers wrapper for the application.
 * Add any context providers or global wrappers here.
 *
 * Example providers to add:
 * - React Query: QueryClientProvider
 * - Toast notifications: Toaster
 * - Theme: ThemeProvider
 */
export function AppProviders({ children }: AppProvidersProps) {
  return <>{children}</>;
}
