import type { Metadata } from 'next';
import './globals.css';
import { AppProviders } from '@/providers/app-providers';

export const metadata: Metadata = {
  title: {
    default: 'Manga Go',
    template: '%s | Manga Go',
  },
  description: 'Read manga online for free with the best reading experience.',
  keywords: ['manga', 'read manga', 'manga online', 'free manga'],
  authors: [{ name: 'Manga Go Team' }],
  creator: 'Manga Go',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL ?? 'https://manga-go.vercel.app',
    title: 'Manga Go',
    description: 'Read manga online for free with the best reading experience.',
    siteName: 'Manga Go',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Manga Go',
    description: 'Read manga online for free with the best reading experience.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased font-sans">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
