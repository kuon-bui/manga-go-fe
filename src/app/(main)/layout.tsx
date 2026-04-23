import { Header } from '@/components/layout/header';
import { BottomNav } from '@/components/layout/bottom-nav';
import { NotificationProvider } from '@/components/layout/notification-provider';
import { RolesSyncProvider } from '@/components/auth/roles-sync-provider';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <RolesSyncProvider />
      <NotificationProvider />
      <Header />
      <main className="flex-1 pb-24 md:pb-0">{children}</main>
      <BottomNav />
    </div>
  );
}
