import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import Image from 'next/image';
import './globals.css';
import { StreamBackground } from '@/components/stream-background';
import { SiteFooter } from '@/components/site-footer';
import { CORRECT_TO_WIN, QUESTIONS_PER_QUIZ } from '@/lib/quiz/config';

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000');

// Derived from the scoring config so the claim cannot drift from the rule.
const description = `A rapid-fire quiz on real streaming architectures. Get ${CORRECT_TO_WIN} of ${QUESTIONS_PER_QUIZ} right and the Iggy tee is yours.`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Can You Think in Streams? — LaserData',
  description,
  openGraph: {
    title: 'Can You Think in Streams?',
    description,
    siteName: 'LaserData Quiz',
    type: 'website',
    url: siteUrl
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Can You Think in Streams?',
    description
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        <StreamBackground />
        <div className="relative z-10">
          <header className="fixed right-4 top-4 z-50">
            <a
              href="https://iggy.apache.org"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.035] px-2.5 py-1.5 transition-colors duration-150 hover:border-white/20 hover:bg-white/[0.06]"
            >
              <span className="mono-heading hidden text-[9px] text-white/50 sm:inline">Powered by</span>
              <Image
                src="https://assets.laserdata.com/apache_iggy_logo.png"
                alt="Apache Iggy"
                width={64}
                height={21}
                unoptimized
              />
            </a>
          </header>
          <div className="flex min-h-screen flex-col">
            <div className="flex-1">{children}</div>
            <SiteFooter />
          </div>
        </div>
      </body>
    </html>
  );
}
