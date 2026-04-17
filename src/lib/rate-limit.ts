import { NextResponse } from 'next/server';

interface LimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

interface Limiter {
  limit(identifier: string): Promise<LimitResult>;
}

const CLEANUP_EVERY_N_INSERTS = 500;

class InMemorySlidingWindow implements Limiter {
  private readonly buckets = new Map<string, number[]>();
  private insertsSinceCleanup = 0;

  constructor(
    private readonly tokens: number,
    private readonly windowMs: number,
  ) {}

  async limit(identifier: string): Promise<LimitResult> {
    const now = Date.now();
    const cutoff = now - this.windowMs;

    const existing = this.buckets.get(identifier) ?? [];
    const active = existing.filter((t) => t > cutoff);

    if (active.length >= this.tokens) {
      return {
        success: false,
        limit: this.tokens,
        remaining: 0,
        reset: active[0] + this.windowMs,
      };
    }

    active.push(now);
    this.buckets.set(identifier, active);

    if (++this.insertsSinceCleanup >= CLEANUP_EVERY_N_INSERTS) {
      this.cleanup(cutoff);
      this.insertsSinceCleanup = 0;
    }

    return {
      success: true,
      limit: this.tokens,
      remaining: this.tokens - active.length,
      reset: now + this.windowMs,
    };
  }

  private cleanup(cutoff: number): void {
    for (const [key, timestamps] of this.buckets) {
      const kept = timestamps.filter((t) => t > cutoff);
      if (kept.length === 0) this.buckets.delete(key);
      else this.buckets.set(key, kept);
    }
  }
}

type Window = { tokens: number; windowMs: number };

const MINUTE = 60_000;

function makeLimiter({ tokens, windowMs }: Window): Limiter {
  return new InMemorySlidingWindow(tokens, windowMs);
}

export const limiters = {
  cloudinaryUpload: makeLimiter({ tokens: 60, windowMs: MINUTE }),
  cloudinaryDelete: makeLimiter({ tokens: 60, windowMs: MINUTE }),
  facebookImport: makeLimiter({ tokens: 20, windowMs: MINUTE }),
  analytics: makeLimiter({ tokens: 120, windowMs: MINUTE }),
};

export type LimiterKey = keyof typeof limiters;

export async function enforceRateLimit(
  limiter: Limiter,
  identifier: string,
): Promise<NextResponse | null> {
  const { success, limit, remaining, reset } = await limiter.limit(identifier);
  if (success) return null;

  const retryAfterSeconds = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
  return NextResponse.json(
    { error: 'Too many requests. Please slow down and try again shortly.' },
    {
      status: 429,
      headers: {
        'X-RateLimit-Limit': String(limit),
        'X-RateLimit-Remaining': String(remaining),
        'X-RateLimit-Reset': String(reset),
        'Retry-After': String(retryAfterSeconds),
      },
    },
  );
}
