import { NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/supabase/server';
import cloudinary, { parseCloudinaryPublicId } from '@/lib/cloudinary';

interface DeleteRequestBody {
  url?: unknown;
  eventId?: unknown;
}

async function isAuthorizedViaEvent(
  supabase: SupabaseClient,
  userId: string,
  eventId: string,
  publicId: string,
): Promise<boolean> {
  const { data: event } = await supabase
    .from('events')
    .select('host_id, image_url')
    .eq('id', eventId)
    .maybeSingle();

  if (!event?.image_url) return false;

  const expectedPublicId = parseCloudinaryPublicId(event.image_url);
  if (expectedPublicId !== publicId) return false;

  const { data: membership } = await supabase
    .from('host_users')
    .select('user_id')
    .eq('user_id', userId)
    .eq('host_id', event.host_id)
    .maybeSingle();

  return Boolean(membership);
}

async function isAuthorizedViaUploader(
  userId: string,
  publicId: string,
): Promise<boolean> {
  try {
    const resource = await cloudinary.api.resource(publicId, { context: true });
    return resource.context?.custom?.uploader_id === userId;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request
      .json()
      .catch(() => null)) as DeleteRequestBody | null;
    if (!body || typeof body.url !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 },
      );
    }

    const publicId = parseCloudinaryPublicId(body.url);
    if (!publicId) {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    const eventId = typeof body.eventId === 'string' ? body.eventId : null;

    const authorized =
      (eventId !== null &&
        (await isAuthorizedViaEvent(supabase, user.id, eventId, publicId))) ||
      (await isAuthorizedViaUploader(user.id, publicId));

    if (!authorized) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await cloudinary.uploader.destroy(publicId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 },
    );
  }
}
