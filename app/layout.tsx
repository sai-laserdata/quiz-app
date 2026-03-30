import type { Metadata } from 'next';
import Image from 'next/image';
import './globals.css';
import { StreamBackground } from '@/components/stream-background';

export const metadata: Metadata = {
  title: 'LaserData Quiz',
  description: 'Take the Laserdata systems quiz. Score 90%+ and grab an Iggy T-shirt.'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <StreamBackground />
        <div className="relative z-10">
          <header className="fixed right-4 top-4 z-50">
            <a href="https://iggy.apache.org" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 opacity-70 transition hover:opacity-100">
              <Image
                src="https://assets.laserdata.com/apache_iggy_logo.png"
                alt="Apache Iggy"
                width={72}
                height={24}
                unoptimized
              />
            </a>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
