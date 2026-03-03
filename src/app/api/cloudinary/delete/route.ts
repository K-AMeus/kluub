import { NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';
import cloudinary from '@/lib/cloudinary';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { url } = await request.json();

    if (!url || !url.includes('res.cloudinary.com')) {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    // Extract public_id from Cloudinary URL
    // Format: https://res.cloudinary.com/{cloud}/image/upload/v{version}/{folder}/{public_id}.{ext}
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/);
    if (!match) {
      return NextResponse.json({ error: 'Could not parse URL' }, { status: 400 });
    }

    const publicId = match[1];
    await cloudinary.uploader.destroy(publicId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 }
    );
  }
}
