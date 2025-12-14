import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
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
  title: 'Kluub - Discover Events in Estonia',
  description: 'Discover the perfect event for every occasion',
  appleWebApp: {
    title: 'Kluub - Discover Events in Estonia',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html lang={locale}>
      <body
        className={`${montserrat.variable} ${delaGothicOne.variable} antialiased font-sans`}
      >
        {children}
      </body>
    </html>
  );
}
