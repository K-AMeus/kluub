'use server';

import { revalidateEvents } from '@/lib/db';

export async function refreshEventsCache() {
  await revalidateEvents();
}
