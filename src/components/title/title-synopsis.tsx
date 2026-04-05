'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

const COLLAPSED_LINES = 4

interface TitleSynopsisProps {
  text: string
  className?: string
}

export function TitleSynopsis({ text, className }: TitleSynopsisProps) {
  const [expanded, setExpanded] = useState(false)

  // Estimate if clamping is needed (rough: 4 lines × ~80 chars = 320)
  const needsClamp = text.length > 280

  return (
    <section className={cn('space-y-2', className)}>
      <h2 className="text-base font-semibold text-foreground">Synopsis</h2>
      <div className="relative">
        <p
          className={cn(
            'whitespace-pre-line text-sm leading-relaxed text-muted-foreground',
            !expanded && needsClamp && `line-clamp-${COLLAPSED_LINES}`
          )}
        >
          {text}
        </p>

        {/* Fade overlay when collapsed */}
        {!expanded && needsClamp && (
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background to-transparent" />
        )}
      </div>

      {needsClamp && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          {expanded ? (
            <>
              Show less <ChevronUp className="h-3.5 w-3.5" />
            </>
          ) : (
            <>
              Show more <ChevronDown className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      )}
    </section>
  )
}
