'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/supabase/server';

export async function signOutAction(locale: string) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(`/${locale}/backstage`);
}
