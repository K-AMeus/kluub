import PrivacyPolicyPage from '@/components/privacy/PrivacyPolicyPage';
import { setRequestLocale, getTranslations } from 'next-intl/server';

export const revalidate = 86400;

type Params = Promise<{ locale: string }>;

export default async function Privacy({ params }: { params: Params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'privacyPage' });

  const parts = [
    t('lastUpdated'),
    t('intro'),
    `## ${t('summary.title')}\n\n${t('summary.body')}`,
    `## ${t('toc.title')}\n\n${t('toc.body')}`,
    ...Array.from(
      { length: 15 },
      (_, i) =>
        `## ${i + 1}. ${t(`section${i + 1}.title`)}\n\n${t(`section${i + 1}.body`)}`,
    ),
  ];

  const content = parts.join('\n\n');

  return <PrivacyPolicyPage title={t('title')} content={content} />;
}
