import { Suspense } from 'react'

import { LibraryView } from '@/components/library/library-view'
import { MangaGridSkeleton } from '@/components/manga/manga-grid'

export const metadata = { title: 'My Library — Manga Go' }

export default function LibraryPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-6">
          <MangaGridSkeleton count={12} />
        </div>
      }
    >
      <LibraryView />
    </Suspense>
  )
}
