'use client';

import { useQuery } from '@tanstack/react-query';

import { apiClient } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import { useAuthStore } from '@/stores/auth-store';

export function useAuthorizationProfile() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: queryKeys.authorization.me(),
    queryFn: () => apiClient.getMyAuthorization(),
    enabled: isAuthenticated,
    staleTime: 30_000,
    refetchInterval: () =>
      typeof document !== 'undefined' && document.visibilityState === 'visible' ? 60_000 : false,
    refetchOnWindowFocus: true,
  });
}
