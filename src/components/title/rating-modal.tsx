'use client'

import { useState } from 'react'
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

  const [score, setScore] = useState<number>(existingRating?.score ?? 0)

  // Sync score when existing rating loads
  const displayScore = score === 0 && existingRating ? existingRating.score : score

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
            value={displayScore}
            onChange={setScore}
            showValue
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
