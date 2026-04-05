import { Suspense } from 'react'

import { SearchView } from '@/components/search/search-view'
import { MangaGridSkeleton } from '@/components/manga/manga-grid'

export const metadata = { title: 'Search — Manga Go' }

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-6">
          <MangaGridSkeleton count={12} />
        </div>
      }
    >
      <SearchView />
    </Suspense>
  )
}
