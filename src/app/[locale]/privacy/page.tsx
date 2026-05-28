import PrivacyPolicyPage from '@/components/privacy/PrivacyPolicyPage';
import { setRequestLocale } from 'next-intl/server';

export const revalidate = 86400;

type Params = Promise<{ locale: string }>;

export default async function Privacy({ params }: { params: Params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PrivacyPolicyPage />;
}
