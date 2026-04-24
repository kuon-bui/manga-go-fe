import { Suspense } from 'react'

import { TrendingSection }       from '@/components/home/trending-section'
import { LatestUpdatesSection }  from '@/components/home/latest-updates-section'
import { RecentlyAddedSection }  from '@/components/home/recently-added-section'
import { CompletedSection }      from '@/components/home/completed-section'
import { RecentCommentsSection } from '@/components/home/recent-comments-section'

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 pt-2 pb-6 space-y-6">

      {/* ── Featured carousel ──────────────────────────────────── */}
      <Suspense>
        <TrendingSection />
      </Suspense>

      {/* ── Chap Mới (left) + Bình Luận Mới (right) ───────────── */}
      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-6">
        <Suspense>
          <LatestUpdatesSection />
        </Suspense>
        <Suspense>
          <RecentCommentsSection />
        </Suspense>
      </div>

      {/* ── Truyện Mới carousel ────────────────────────────────── */}
      <Suspense>
        <RecentlyAddedSection />
      </Suspense>

      {/* ── Đã Hoàn Thành carousel ─────────────────────────────── */}
      <Suspense>
        <CompletedSection />
      </Suspense>

      {/* ── Footer note ────────────────────────────────────────── */}
      <p className="text-center text-xs text-muted-foreground py-4">
        ✦ Made with love · Manga Go © 2026
      </p>
    </div>
  )
}
