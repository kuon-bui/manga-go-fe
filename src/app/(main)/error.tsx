'use client'

import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function MainGroupError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <AlertTriangle className="h-10 w-10 text-destructive opacity-80" />
      <h1 className="text-lg font-bold text-foreground">Page error</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        This page encountered an error. Try refreshing or go back.
      </p>
      <div className="flex gap-3">
        <Button variant="outline" size="sm" onClick={reset}>Retry</Button>
        <Button size="sm" asChild>
          <Link href="/">Home</Link>
        </Button>
      </div>
    </div>
  )
}
