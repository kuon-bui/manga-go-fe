import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

import { SettingsView } from '@/components/profile/settings-view'
import { Skeleton } from '@/components/ui/skeleton'

export const metadata = { title: 'Settings — Manga Go' }

export default async function SettingsPage() {
  const cookieStore = await cookies()
  if (!cookieStore.get('manga-go-token')) redirect('/login')

  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <SettingsView />
    </Suspense>
  )
}
