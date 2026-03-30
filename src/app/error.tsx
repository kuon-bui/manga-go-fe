'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-red-500 mb-4">Oops!</h1>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          Something went wrong
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>
        <Button onClick={reset}>Try Again</Button>
      </div>
    </div>
  );
}
