import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Kluub - Discover Events',
  description: 'Discover the perfect event for every occasion',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
