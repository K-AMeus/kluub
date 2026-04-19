import { redirect } from 'next/navigation';

export default async function EventsRedirect({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/events/tartu`);
}
