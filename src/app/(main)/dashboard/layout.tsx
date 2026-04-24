import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { DashboardNav } from '@/components/dashboard/dashboard-nav'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  if (!cookieStore.get('manga-go-token')) redirect('/login')

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 pt-2 pb-10 space-y-4 md:space-y-0">
      <div className="flex flex-col gap-4 md:flex-row md:gap-6 md:items-start">
        <DashboardNav />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  )
}
