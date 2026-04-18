import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
};

type Params = Promise<{ locale: string }>;

const SITE_URL = 'https://www.kluub.ee';
const OG_IMAGE = '/web-app-manifest-512x512.png';

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });
  const title = t('title');
  const description = t('description');

  const canonical = locale === routing.defaultLocale ? '/' : `/${locale}`;
  const languages: Record<string, string> = {
    'x-default': '/',
  };
  for (const l of routing.locales) {
    languages[l] = l === routing.defaultLocale ? '/' : `/${l}`;
  }

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    applicationName: 'Kluub',
    appleWebApp: { title },
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      type: 'website',
      siteName: 'Kluub',
      url: canonical,
      title,
      description,
      locale: locale === 'et' ? 'et_EE' : 'en_US',
      images: [
        {
          url: OG_IMAGE,
          width: 512,
          height: 512,
          alt: 'Kluub',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [OG_IMAGE],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Params;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
