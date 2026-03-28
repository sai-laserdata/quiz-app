import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'High-Performance Systems IQ Quiz',
  description: 'Conference lead-gen quiz for systems engineers and architects.'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
