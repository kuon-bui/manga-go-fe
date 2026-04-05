import Image from 'next/image'
import Link from 'next/link'
import { BookOpen } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// Placeholder hero — swapped for real featured content in Phase 3+
export function HeroSection() {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-background to-background dark:from-primary/10">
      <div className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:gap-8 md:p-10">
        {/* Text */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="ongoing">Featured</Badge>
            <Badge variant="manga">Manga</Badge>
          </div>
          <h1 className="text-2xl font-bold leading-tight text-foreground md:text-3xl lg:text-4xl">
            Discover & Read Your Favourite Titles
          </h1>
          <p className="text-sm text-muted-foreground md:text-base">
            Thousands of manga and light novels — updated daily by translator groups worldwide.
          </p>
          <div className="flex items-center gap-3 pt-1">
            <Button asChild>
              <Link href="/browse">
                <BookOpen className="h-4 w-4" />
                Start Reading
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/browse?type=novel">Browse Novels</Link>
            </Button>
          </div>
        </div>

        {/* Decorative cover stack — replaced with real content later */}
        <div className="hidden md:flex md:shrink-0 md:items-center md:gap-3">
          <CoverPlaceholder className="h-52 w-36 -rotate-3 opacity-70" />
          <CoverPlaceholder className="h-64 w-44" />
          <CoverPlaceholder className="h-52 w-36 rotate-3 opacity-70" />
        </div>
      </div>
    </section>
  )
}

function CoverPlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={`rounded-xl bg-primary/10 dark:bg-primary/20 ${className ?? ''}`}
    />
  )
}
