import type { Metadata } from 'next';
import { Nunito, Quicksand } from 'next/font/google';
import { Providers } from '@/components/providers/providers';
import { Toaster } from '@/components/ui/sonner';
import '@/app/globals.css';

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  display: 'swap',
});

const quicksand = Quicksand({
  subsets: ['latin'],
  variable: '--font-quicksand',
  weight: ['500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Manga Go',
    template: '%s | Manga Go',
  },
  description: 'Đọc manga và light novel — nền tảng đọc truyện đa thể loại.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="vi"
      className={`${nunito.variable} ${quicksand.variable}`}
      suppressHydrationWarning
    >
      <body>
        <Providers>{children}</Providers>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
