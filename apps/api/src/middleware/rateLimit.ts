type Bucket = number[];

const buckets = new Map<string, Bucket>();

export function createRateLimiter(limit: number, windowMs: number) {
  return (key: string): { allowed: boolean; retryAfterSec: number } => {
    const now = Date.now();
    const cutoff = now - windowMs;
    const existing = (buckets.get(key) ?? []).filter((ts) => ts > cutoff);

    if (existing.length >= limit) {
      buckets.set(key, existing);
      const oldest = existing[0] ?? now;
      return {
        allowed: false,
        retryAfterSec: Math.max(1, Math.ceil((oldest + windowMs - now) / 1000)),
      };
    }

    existing.push(now);
    buckets.set(key, existing);
    return { allowed: true, retryAfterSec: 0 };
  };
}

export const telegramStartLimiter = createRateLimiter(10, 10 * 60 * 1000);
