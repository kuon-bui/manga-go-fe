import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useNotificationStream } from '@/hooks/use-notifications';
import { useAuthStore } from '@/stores/auth-store';

class EventSourceStub {
  static instances: EventSourceStub[] = [];

  readonly url: string;
  readonly options?: EventSourceInit;
  onerror: ((_event: Event) => void) | null = null;

  constructor(url: string | URL, options?: EventSourceInit) {
    this.url = String(url);
    this.options = options;
    EventSourceStub.instances.push(this);
  }

  addEventListener(): void {}

  close(): void {}
}

describe('useNotificationStream', () => {
  beforeEach(() => {
    EventSourceStub.instances = [];
    vi.stubGlobal('EventSource', EventSourceStub);
    act(() => {
      useAuthStore.setState({ isAuthenticated: true });
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    act(() => {
      useAuthStore.setState({ isAuthenticated: false });
    });
  });

  it('opens the stream through the same-origin proxy', () => {
    const queryClient = new QueryClient();

    renderHook(() => useNotificationStream(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      ),
    });

    expect(EventSourceStub.instances[0]?.url).toBe('/api/notifications/stream');
    expect(EventSourceStub.instances[0]?.options).toEqual({ withCredentials: true });
  });
});
