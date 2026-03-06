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

    const uploadPath = url.split('/upload/')[1];
    if (!uploadPath) {
      return NextResponse.json({ error: 'Could not parse URL' }, { status: 400 });
    }

    const segments = uploadPath.split('/');
    const versionIndex = segments.findIndex((s: string) => /^v\d+$/.test(s));
    const publicIdSegments = versionIndex >= 0
      ? segments.slice(versionIndex + 1)
      : segments;
    const publicId = publicIdSegments.join('/').replace(/\.[^.]+$/, '');

    if (!publicId) {
      return NextResponse.json({ error: 'Could not extract public ID' }, { status: 400 });
    }

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
