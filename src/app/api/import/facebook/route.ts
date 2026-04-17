import { NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { parse as parseHTML, HTMLElement } from 'node-html-parser';
import { createClient } from '@/supabase/server';
import { enforceRateLimit, limiters } from '@/lib/rate-limit';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

interface FacebookEventData {
  title: string | null;
  description: string | null;
  imageUrl: string | null;
  startTime: string | null;
  endTime: string | null;
  facebookUrl: string;
}

function extractOgTag(root: HTMLElement, property: string): string | null {
  const meta = root.querySelector(`meta[property="${property}"]`);
  return meta?.getAttribute('content') ?? null;
}

function extractFromScripts(root: HTMLElement) {
  let description: string | null = null;
  let startTime: string | null = null;
  let endTime: string | null = null;

  for (const el of root.querySelectorAll('script')) {
    const text = el.rawText;

    if (!description) {
      const match = text.match(
        /"event_description"\s*:\s*\{\s*"text"\s*:\s*"((?:[^"\\]|\\.)*)"/,
      );
      if (match?.[1]) description = unescapeJsonString(match[1]);
    }

    if (!startTime) {
      const startMatch = text.match(/"start_timestamp"\s*:\s*(\d{10,13})/);
      if (startMatch?.[1]) {
        const ts = Number(startMatch[1]);
        startTime = new Date(ts > 1e12 ? ts : ts * 1000).toISOString();
      }
    }

    if (!endTime) {
      const endMatch = text.match(/"end_timestamp"\s*:\s*(\d{10,13})/);
      if (endMatch?.[1]) {
        const ts = Number(endMatch[1]);
        endTime = new Date(ts > 1e12 ? ts : ts * 1000).toISOString();
      }
    }

    if (description && startTime) break;
  }

  return { description, startTime, endTime };
}

function unescapeJsonString(str: string): string {
  try {
    return JSON.parse(`"${str}"`);
  } catch {
    return str
      .replace(/\\n/g, '\n')
      .replace(/\\t/g, '\t')
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\');
  }
}

function normalizeFacebookUrl(url: string): string {
  const trimmed = url.trim();
  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
  try {
    return new URL(withProtocol).href;
  } catch {
    return trimmed;
  }
}

function isFacebookEventUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.replace('www.', '').replace('m.', '');
    if (hostname === 'facebook.com' && parsed.pathname.includes('/events/'))
      return true;
    if (hostname === 'fb.me') return true;
    return false;
  } catch {
    return false;
  }
}

const LOGIN_WALL_PATTERNS = [
  'Log in or sign up to view',
  'Vaatamiseks logi sisse',
  'Logi sisse või registreeru',
];

function isLoginWall(ogTitle: string | null): boolean {
  if (!ogTitle) return false;
  return LOGIN_WALL_PATTERNS.some((p) => ogTitle.includes(p));
}

function isTimeoutError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === 'TimeoutError' || error.name === 'AbortError')
  );
}

async function fetchFacebookImage(
  url: string,
  maxBytes: number,
): Promise<{ buffer: Buffer; contentType: string } | null> {
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      Accept: 'image/webp,image/apng,image/*,*/*;q=0.8',
    },
    redirect: 'follow',
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) return null;

  const contentType = res.headers.get('content-type') ?? '';
  if (!contentType.startsWith('image/')) return null;

  const declaredLength = Number(res.headers.get('content-length'));
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) return null;

  if (!res.body) return null;

  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    received += value.byteLength;
    if (received > maxBytes) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }

  return { buffer: Buffer.concat(chunks), contentType };
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

    const blocked = await enforceRateLimit(limiters.facebookImport, user.id);
    if (blocked) return blocked;

    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const normalizedUrl = normalizeFacebookUrl(url.trim());

    if (!isFacebookEventUrl(normalizedUrl)) {
      return NextResponse.json(
        { error: 'Please provide a valid Facebook event URL' },
        { status: 400 },
      );
    }

    const response = await fetch(normalizedUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch event page (status ${response.status})` },
        { status: 502 },
      );
    }

    const html = await response.text();
    const root = parseHTML(html);

    const ogTitle = extractOgTag(root, 'og:title');
    const ogImage = extractOgTag(root, 'og:image');

    if (isLoginWall(ogTitle)) {
      return NextResponse.json(
        {
          error:
            'This event appears to be private or requires login. Only public Facebook events can be imported.',
        },
        { status: 422 },
      );
    }

    const { description, startTime, endTime } = extractFromScripts(root);

    let persistentImageUrl: string | null = null;
    if (ogImage) {
      try {
        const fetched = await fetchFacebookImage(ogImage, MAX_IMAGE_SIZE);
        if (fetched) {
          persistentImageUrl = await uploadToCloudinary(
            fetched.buffer,
            fetched.contentType,
            { uploaderId: user.id },
          );
        }
      } catch (imgError) {
        console.error('Failed to upload FB image to Cloudinary:', imgError);
      }
    }

    const result: FacebookEventData = {
      title: ogTitle,
      description,
      imageUrl: persistentImageUrl,
      startTime,
      endTime,
      facebookUrl: normalizedUrl,
    };

    if (!result.title) {
      return NextResponse.json(
        {
          error:
            'Could not extract event data. The event may be private or the page structure has changed.',
          partial: result,
        },
        { status: 422 },
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error importing Facebook event:', error);

    if (isTimeoutError(error)) {
      return NextResponse.json(
        { error: 'Facebook took too long to respond. Please try again.' },
        { status: 504 },
      );
    }

    return NextResponse.json(
      { error: 'Failed to import event. Please try again.' },
      { status: 500 },
    );
  }
}
