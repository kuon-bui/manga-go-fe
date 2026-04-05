import { Suspense } from 'react'

import { HeroSection } from '@/components/home/hero-section'
import { TrendingSection } from '@/components/home/trending-section'
import { RecentlyUpdatedSection } from '@/components/home/recently-updated-section'
import { GenreSection } from '@/components/home/genre-section'

export default function HomePage() {
  return (
    <div className="container mx-auto space-y-8 px-4 py-6 md:py-8">
      <Suspense>
        <HeroSection />
      </Suspense>
      <Suspense>
        <TrendingSection />
      </Suspense>
      <Suspense>
        <GenreSection />
      </Suspense>
      <Suspense>
        <RecentlyUpdatedSection />
      </Suspense>
    </div>
  )
}
