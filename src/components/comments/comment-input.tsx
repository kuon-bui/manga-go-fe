'use client'

import { useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface CommentInputProps {
  placeholder?: string
  autoFocus?: boolean
  onSubmit: (_body: string) => void
  onCancel?: () => void
}

export function CommentInput({
  placeholder = 'Write a comment…',
  autoFocus = false,
  onSubmit,
  onCancel,
}: CommentInputProps) {
  const [value, setValue] = useState('')
  const ref = useRef<HTMLTextAreaElement>(null)

  function handleSubmit() {
    const trimmed = value.trim()
    if (!trimmed) return
    onSubmit(trimmed)
    setValue('')
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit()
    }
    if (e.key === 'Escape') {
      onCancel?.()
    }
  }

  return (
    <div className="space-y-2">
      <Textarea
        ref={ref}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder ?? 'Viết bình luận…'}
        autoFocus={autoFocus}
        rows={3}
        className="resize-none text-sm"
      />
      <div className="flex items-center justify-end gap-2">
        {onCancel && (
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Huỷ
          </Button>
        )}
        <Button size="sm" disabled={!value.trim()} onClick={handleSubmit}>
          Gửi
        </Button>
      </div>
    </div>
  )
}
