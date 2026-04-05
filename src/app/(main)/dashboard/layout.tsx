import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { LayoutDashboard, Users, Upload } from 'lucide-react'

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/groups', label: 'My Groups', icon: Users },
  { href: '/dashboard/upload/title', label: 'Upload Title', icon: Upload },
]

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const token = cookieStore.get('manga-go-token')
  if (!token) redirect('/login')

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col gap-6 md:flex-row">
        {/* Sidebar nav */}
        <aside className="w-full shrink-0 md:w-52">
          <nav className="flex flex-row gap-1 md:flex-col" aria-label="Dashboard navigation">
            {NAV.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                {label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  )
}
