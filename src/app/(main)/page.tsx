import { Suspense } from 'react'


import { TrendingSection } from '@/components/home/trending-section'
import { RecentlyUpdatedSection } from '@/components/home/recently-updated-section'
import { GenreSection } from '@/components/home/genre-section'

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Suspense>
        <TrendingSection />
      </Suspense>
      
      <div className="container mx-auto space-y-8 px-4 py-6 md:py-8 flex-1">
        <Suspense>
          <GenreSection />
        </Suspense>
        <Suspense>
          <RecentlyUpdatedSection />
        </Suspense>
      </div>
    </div>
  )
}
