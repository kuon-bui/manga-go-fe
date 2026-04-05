'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

interface StarRatingProps {
  /** Current value on the 1–10 scale */
  value: number
  /** Called with the new 1–10 score when the user picks a rating */
  onChange?: (_score: number) => void
  /** Read-only aggregate display — no hover/click interaction */
  readOnly?: boolean
  /** Show the numeric score beside the stars */
  showValue?: boolean
  /** Show the vote count beside the score */
  voteCount?: number
  className?: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Maps a 1–10 score to a 0–5 half-star display value.
 * score 8.4 → 4.2 display stars
 */
function scoreToStars(score: number): number {
  return score / 2
}

// ─── Component ────────────────────────────────────────────────────────────────

export function StarRating({
  value,
  onChange,
  readOnly = false,
  showValue = true,
  voteCount,
  className,
}: StarRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null)

  const displayStars = scoreToStars(hovered ?? value)
  const interactive = !readOnly && onChange !== undefined

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <div
        className="flex items-center"
        onMouseLeave={() => interactive && setHovered(null)}
      >
        {Array.from({ length: 5 }).map((_, i) => {
          const starIndex = i + 1 // 1–5
          const filled = displayStars >= starIndex
          const halfFilled = !filled && displayStars >= starIndex - 0.5

          return (
            <span
              key={i}
              className={cn(
                'relative inline-block',
                interactive && 'cursor-pointer'
              )}
              onMouseEnter={() => {
                if (!interactive) return
                // hovering over left half = half star, right half = full star
                // simplified: each star icon = 0.5 increments via two halves
                setHovered((starIndex - 0.5) * 2) // e.g. star 3 left = score 5
              }}
              onClick={() => {
                if (!interactive) return
                onChange?.((starIndex - 0.5) * 2)
              }}
            >
              {/* Full star hover zone */}
              <span
                className="absolute inset-0 left-1/2"
                onMouseEnter={(e) => {
                  e.stopPropagation()
                  if (!interactive) return
                  setHovered(starIndex * 2) // full star = score e.g. 6 for star 3
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  if (!interactive) return
                  onChange?.(starIndex * 2)
                }}
              />

              <Star
                className={cn(
                  'h-5 w-5 transition-colors',
                  filled
                    ? 'fill-yellow-400 text-yellow-400'
                    : halfFilled
                      ? 'fill-yellow-200 text-yellow-400 dark:fill-yellow-600'
                      : 'fill-transparent text-muted-foreground/40'
                )}
              />
            </span>
          )
        })}
      </div>

      {showValue && (
        <span className="text-sm font-medium text-foreground">
          {(hovered ?? value).toFixed(1)}
          {!interactive && voteCount !== undefined && (
            <span className="ml-1 text-xs font-normal text-muted-foreground">
              ({voteCount.toLocaleString()})
            </span>
          )}
        </span>
      )}
    </div>
  )
}
