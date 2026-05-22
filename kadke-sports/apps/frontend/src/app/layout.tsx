import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import '../styles/globals.css';
import { Providers } from './providers';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Toaster } from 'react-hot-toast';

const sans = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const display = Playfair_Display({ subsets: ['latin'], variable: '--font-display', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: { default: 'Kadke Sports — Premium Indian Sports Gear', template: '%s · Kadke Sports' },
  description: 'Premium cricket, football, jerseys, shoes & fitness gear. Hand-picked for Indian athletes.',
  keywords: ['cricket', 'football', 'jerseys', 'sports shoes', 'fitness', 'India'],
  openGraph: {
    title: 'Kadke Sports', description: 'Premium Indian sports gear', type: 'website',
    images: ['/og.jpg'],
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster position="bottom-right" toastOptions={{ className: 'dark:!bg-ink-900 dark:!text-white' }} />
        </Providers>
      </body>
    </html>
  );
}
