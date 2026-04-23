'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'

interface GenreChipProps {
  label: string
  slug: string
  active?: boolean
  className?: string
}

export function GenreChip({ label, slug, active = false, className }: GenreChipProps) {
  const href = slug ? `/browse?genre=${slug}` : '/browse'
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium transition-colors',
        active
          ? 'border-primary bg-primary text-primary-foreground shadow-sakura-sm'
          : 'border-border bg-background text-foreground hover:bg-primary/15 hover:text-primary hover:border-primary/40 dark:border-border dark:bg-card dark:hover:bg-primary/20',
        className
      )}
    >
      {label}
    </Link>
  )
}
