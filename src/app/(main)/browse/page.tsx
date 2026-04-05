import { Suspense } from 'react'

import { BrowseView } from '@/components/browse/browse-view'
import { MangaGridSkeleton } from '@/components/manga/manga-grid'

export const metadata = { title: 'Browse — Manga Go' }

export default function BrowsePage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-6">
          <MangaGridSkeleton count={12} />
        </div>
      }
    >
      <BrowseView />
    </Suspense>
  )
}
