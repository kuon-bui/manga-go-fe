import type { Metadata } from 'next';
import { Providers } from '@/components/providers/providers';
import { Toaster } from '@/components/ui/sonner';
import '@/app/globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Manga Go',
    template: '%s | Manga Go',
  },
  description: 'Read manga and light novels — a modern multi-mode reading platform.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>{children}</Providers>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
