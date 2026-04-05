'use client'

import { useEffect, useState } from 'react'

export function MSWProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_API_MOCKING !== 'enabled') {
      setReady(true)
      return
    }

    import('@/mocks/browser').then(({ worker }) => {
      worker
        .start({
          onUnhandledRequest: 'bypass', // don't warn for Next.js internal requests
          serviceWorker: { url: '/mockServiceWorker.js' },
        })
        .then(() => setReady(true))
    })
  }, [])

  if (!ready) return null

  return <>{children}</>
}
