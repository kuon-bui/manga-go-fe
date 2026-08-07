'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { AccessState } from '@/components/admin/access/access-state';
import { firstAllowedAccessPath } from '@/components/admin/access/access-tabs';
import { useAuthorization } from '@/components/auth/authorization-provider';
import { Skeleton } from '@/components/ui/skeleton';

export default function AccessIndexPage() {
  const router = useRouter();
  const { profile, isLoading, isError, refetch } = useAuthorization();

  useEffect(() => {
    if (!isLoading && !isError) router.replace(firstAllowedAccessPath(profile) ?? '/');
  }, [isError, isLoading, profile, router]);

  if (isLoading) return <Skeleton className="h-40 w-full rounded-2xl" />;
  if (isError) {
    return (
      <AccessState
        title="Không thể xác định trang được phép"
        message="Hãy tải lại hồ sơ phân quyền rồi thử lại."
        retry={() => void refetch()}
      />
    );
  }
  return <Skeleton className="h-20 w-full rounded-2xl" />;
}
