'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { StarRating } from '@/components/ui/star-rating'
import { useUserRating, useSubmitRating } from '@/hooks/use-title-detail'

interface RatingModalProps {
  open: boolean
  onOpenChange: (_open: boolean) => void
  mangaId: string
  mangaTitle: string
}

export function RatingModal({ open, onOpenChange, mangaId, mangaTitle }: RatingModalProps) {
  const { data: existingRating } = useUserRating(mangaId)
  const submitMutation = useSubmitRating(mangaId)
  const existingScore = normalizeScore(existingRating?.score)

  const [score, setScore] = useState<number | null>(null)

  useEffect(() => {
    if (!open) return
    setScore(null)
  }, [open, mangaId])

  const displayScore = score ?? existingScore

  function handleScoreChange(nextScore: number) {
    setScore(normalizeScore(Math.ceil(nextScore / 2)))
  }

  function handleSubmit() {
    if (displayScore === 0) return
    submitMutation.mutate(displayScore, {
      onSuccess: () => {
        toast.success('Rating submitted!')
        onOpenChange(false)
      },
      onError: () => {
        toast.error('Failed to submit rating. Please try again.')
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Rate this title</DialogTitle>
          <DialogDescription className="line-clamp-1">{mangaTitle}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          <StarRating
            value={displayScore > 0 ? displayScore * 2 : 0}
            onChange={handleScoreChange}
            showValue={false}
            className="scale-125"
          />
          <p className="text-xs text-muted-foreground">
            {displayScore === 0
              ? 'Select a rating'
              : scoreLabel(displayScore)}
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={displayScore === 0 || submitMutation.isPending}
          >
            {submitMutation.isPending ? 'Submitting…' : 'Submit Rating'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function scoreLabel(score: number): string {
  if (score === 1) return 'Tệ'
  if (score === 2) return 'Bình thường'
  if (score === 3) return 'Khá'
  if (score === 4) return 'Tốt'
  return 'Xuất sắc'
}

function normalizeScore(score: number | null | undefined): number {
  if (typeof score !== 'number' || !Number.isFinite(score)) return 0
  return Math.min(5, Math.max(1, Math.round(score)))
}
