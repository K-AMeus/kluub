import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

export const CLOUDINARY_FOLDER = 'kluub-events';
export const CLOUDINARY_HOSTNAME = 'res.cloudinary.com';

export interface UploadOptions {
  uploaderId: string;
}

export async function uploadToCloudinary(
  buffer: Buffer,
  contentType: string,
  { uploaderId }: UploadOptions,
): Promise<string> {
  const dataUri = `data:${contentType};base64,${buffer.toString('base64')}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: CLOUDINARY_FOLDER,
    resource_type: 'image',
    context: { uploader_id: uploaderId },
    transformation: [
      { width: 1200, crop: 'limit' },
      { quality: 'auto:good' },
      { fetch_format: 'auto' },
    ],
  });

  return result.secure_url;
}

export function parseCloudinaryPublicId(rawUrl: string): string | null {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  if (!cloudName) return null;

  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return null;
  }

  if (parsed.protocol !== 'https:') return null;
  if (parsed.hostname !== CLOUDINARY_HOSTNAME) return null;

  const expectedPrefix = `/${cloudName}/`;
  if (!parsed.pathname.startsWith(expectedPrefix)) return null;

  const uploadMarker = '/upload/';
  const uploadIdx = parsed.pathname.indexOf(uploadMarker);
  if (uploadIdx < 0) return null;

  const afterUpload = parsed.pathname
    .slice(uploadIdx + uploadMarker.length)
    .split('/')
    .filter(Boolean);

  const withoutVersion = /^v\d+$/.test(afterUpload[0] ?? '')
    ? afterUpload.slice(1)
    : afterUpload;

  if (withoutVersion.length === 0) return null;

  const publicId = withoutVersion.join('/').replace(/\.[^./]+$/, '');

  if (!/^[a-zA-Z0-9_\-/]+$/.test(publicId)) return null;

  return publicId;
}
