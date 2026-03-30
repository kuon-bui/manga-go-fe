'use client';

import { useExampleStore } from '@/stores/use-example-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function CounterExample() {
  // Using selectors for performance - only re-renders when these specific values change
  const count = useExampleStore((state) => state.count);
  const user = useExampleStore((state) => state.user);
  const isLoading = useExampleStore((state) => state.isLoading);
  const increment = useExampleStore((state) => state.increment);
  const decrement = useExampleStore((state) => state.decrement);
  const reset = useExampleStore((state) => state.reset);
  const setUser = useExampleStore((state) => state.setUser);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">Counter with Zustand</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Counter */}
        <div className="flex flex-col items-center gap-4">
          <div className="text-6xl font-bold text-primary-600 dark:text-primary-400 tabular-nums">
            {count}
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={decrement} aria-label="Decrement">
              −
            </Button>
            <Button onClick={increment} aria-label="Increment">
              +
            </Button>
            <Button variant="ghost" size="sm" onClick={reset}>
              Reset
            </Button>
          </div>
        </div>

        {/* Divider */}
        <hr className="border-gray-200 dark:border-gray-700" />

        {/* User State */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Persisted User State:
          </p>
          {user ? (
            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setUser(null)}>
                Clear
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              isLoading={isLoading}
              onClick={() =>
                setUser({ name: 'Manga Reader', email: 'reader@manga-go.com', id: '1' })
              }
              className="w-full"
            >
              Set Example User
            </Button>
          )}
        </div>

        {/* Info */}
        <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
          State is persisted in localStorage via Zustand persist middleware
        </p>
      </CardContent>
    </Card>
  );
}
