import { Suspense } from 'react'

import { TrendingSection }        from '@/components/home/trending-section'
import { LatestUpdatesSection }   from '@/components/home/latest-updates-section'
import { RecentlyAddedSection }   from '@/components/home/recently-added-section'
import { CompletedSection }       from '@/components/home/completed-section'
import { FeaturedByThemeSection } from '@/components/home/featured-by-theme-section'
import { RecentCommentsSection }  from '@/components/home/recent-comments-section'

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 py-6 space-y-6">

      {/* ── Featured carousel ──────────────────────────────────── */}
      <Suspense>
        <TrendingSection />
      </Suspense>

      {/* ── Main 2-col body ────────────────────────────────────── */}
      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-6">

        {/* Latest updates */}
        <Suspense>
          <LatestUpdatesSection />
        </Suspense>

        {/* Recently added */}
        <Suspense>
          <RecentlyAddedSection />
        </Suspense>
      </div>

      {/* ── Completed ──────────────────────────────────────────── */}
      <Suspense>
        <CompletedSection />
      </Suspense>

      {/* ── Sidebar pair ───────────────────────────────────────── */}
      <div className="grid md:grid-cols-[1.4fr_1fr] gap-6">
        <Suspense>
          <FeaturedByThemeSection />
        </Suspense>
        <Suspense>
          <RecentCommentsSection />
        </Suspense>
      </div>

      {/* ── Footer note ────────────────────────────────────────── */}
      <p className="text-center text-xs text-muted-foreground py-4">
        ✦ Made with love · Manga Go © 2026
      </p>
    </div>
  )
}
