import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Kluub - Discover Events in Estonia',
  description: 'Discover the perfect event for every occasion',
  appleWebApp: {
    title: 'Kluub - Discover Events in Estonia',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
