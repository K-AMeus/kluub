import { getLocale } from 'next-intl/server';
import { Montserrat, Dela_Gothic_One } from 'next/font/google';
import PostHogProvider from '@/components/shared/PostHogProvider';
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
        <PostHogProvider>{children}</PostHogProvider>
      </body>
    </html>
  );
}
