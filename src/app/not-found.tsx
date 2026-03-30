import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-primary-600 dark:text-primary-400">404</h1>
        <h2 className="mt-4 text-3xl font-semibold text-gray-900 dark:text-white">
          Page not found
        </h2>
        <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-md">
          The page you are looking for might have been removed, had its name changed, or is
          temporarily unavailable.
        </p>
        <div className="mt-8">
          <Button asChild>
            <Link href="/">Go back home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
