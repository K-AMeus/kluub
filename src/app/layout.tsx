import type { Metadata } from 'next';
import { Montserrat, Dela_Gothic_One } from 'next/font/google';
import './globals.css';

const montserrat = Montserrat({
  variable: '--font-montserrat',
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
});

const delaGothicOne = Dela_Gothic_One({
  variable: '--font-dela-gothic',
  weight: '400',
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Kluub - Discover Events',
  description: 'Discover the best events in your city',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
