'use client'

import { useEffect } from 'react'

export function MSWProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_API_MOCKING !== 'enabled') return

    import('@/mocks/browser').then(({ worker }) => {
      // Only start if not already active (avoids double-start in dev hot reload)
      if (worker.listHandlers().length > 0 && 'state' in worker) return

      worker.start({
        onUnhandledRequest: 'bypass',
        serviceWorker: { url: '/mockServiceWorker.js' },
      })
    })
  }, [])

  return <>{children}</>
}
