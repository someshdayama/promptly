interface RateLimitBucket {
  tokens: number;
  lastRefill: number;
}

/**
 * In-memory token bucket per IP. It only protects a single server instance
 * (each serverless instance has its own memory), so it is a first line of
 * defence, not a hard global limit.
 */
const buckets = new Map<string, RateLimitBucket>();

const LIMIT = 5; // requests
const WINDOW_MS = 60000; // refill window
const REFILL_RATE = LIMIT / (WINDOW_MS / 1000); // tokens per second
const MAX_BUCKETS = 5000; // cap memory use

export function rateLimit(ip: string): { success: boolean; limit: number; remaining: number; reset: number } {
  const now = Date.now();
  let bucket = buckets.get(ip);

  if (!bucket) {
    if (buckets.size >= MAX_BUCKETS) {
      // Drop the oldest entries (Map keeps insertion order).
      const drop = Math.ceil(MAX_BUCKETS / 10);
      for (const k of buckets.keys()) {
        buckets.delete(k);
        if (buckets.size <= MAX_BUCKETS - drop) break;
      }
    }
    bucket = { tokens: LIMIT, lastRefill: now };
  } else {
    const elapsedSeconds = (now - bucket.lastRefill) / 1000;
    bucket.tokens = Math.min(LIMIT, bucket.tokens + elapsedSeconds * REFILL_RATE);
    bucket.lastRefill = now;
  }

  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    buckets.set(ip, bucket);
    return { success: true, limit: LIMIT, remaining: Math.floor(bucket.tokens), reset: Math.ceil((LIMIT - bucket.tokens) / REFILL_RATE) };
  }

  buckets.set(ip, bucket);
  return { success: false, limit: LIMIT, remaining: 0, reset: Math.ceil((1 - bucket.tokens) / REFILL_RATE) };
}
