'use client';

import { createContext, useContext, useEffect, type ReactNode } from 'react';

import { useAuthorizationProfile } from '@/hooks/use-authorization';
import { hasAuthorization, type AuthorizationRequirement } from '@/lib/authorization';
import { ApiClientError } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';
import type { AuthorizationProfile } from '@/types/rbac';

interface AuthorizationContextValue {
  profile: AuthorizationProfile | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => Promise<unknown>;
  isAllowed: (_requirement: AuthorizationRequirement) => boolean;
}

const AuthorizationContext = createContext<AuthorizationContextValue | null>(null);

export function AuthorizationProvider({ children }: { children: ReactNode }) {
  const query = useAuthorizationProfile();
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    if (query.error instanceof ApiClientError && query.error.statusCode === 401) {
      logout();
    }
  }, [logout, query.error]);

  const value: AuthorizationContextValue = {
    profile: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isAllowed: (requirement) => hasAuthorization(query.data, requirement),
  };

  return <AuthorizationContext.Provider value={value}>{children}</AuthorizationContext.Provider>;
}

export function useAuthorization(): AuthorizationContextValue {
  const value = useContext(AuthorizationContext);
  if (!value) {
    throw new Error('useAuthorization must be used within AuthorizationProvider');
  }
  return value;
}

export type { AuthorizationContextValue };
