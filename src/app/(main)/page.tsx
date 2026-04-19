import { Suspense } from 'react'

import { TrendingSection } from '@/components/home/trending-section'
import { LatestUpdatesSection } from '@/components/home/latest-updates-section'
import { RecentlyAddedSection } from '@/components/home/recently-added-section'
import { CompletedSection } from '@/components/home/completed-section'

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Suspense>
        <TrendingSection />
      </Suspense>

      <div className="w-full max-w-screen-2xl mx-auto space-y-10 px-4 md:px-8 py-6 md:py-8 flex-1">
        <Suspense>
          <LatestUpdatesSection />
        </Suspense>
        <Suspense>
          <RecentlyAddedSection />
        </Suspense>
        <Suspense>
          <CompletedSection />
        </Suspense>
      </div>
    </div>
  )
}
