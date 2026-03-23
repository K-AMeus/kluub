import JoinPage from '@/components/join/JoinPage';
import { setRequestLocale } from 'next-intl/server';

export const revalidate = 86400;

type Params = Promise<{ locale: string }>;

export default async function Join({ params }: { params: Params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <JoinPage />;
}
