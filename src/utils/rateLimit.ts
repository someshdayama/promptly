interface RateLimitBucket {
  tokens: number;
  lastRefill: number;
}

const buckets = new Map<string, RateLimitBucket>();

const LIMIT = 5; // Max 5 requests
const WINDOW_MS = 60000; // Refill window of 60 seconds
const REFILL_RATE = LIMIT / (WINDOW_MS / 1000); // Refill tokens per second (5 tokens per 60s = 0.083 tokens/sec)

/**
 * Lightweight token-bucket rate limiter.
 * Tracks client IP in-memory to prevent rapid API spamming.
 */
export function rateLimit(ip: string): { success: boolean; limit: number; remaining: number; reset: number } {
  const now = Date.now();
  let bucket = buckets.get(ip);

  if (!bucket) {
    bucket = { tokens: LIMIT, lastRefill: now };
  } else {
    // Refill tokens based on elapsed time
    const elapsedSeconds = (now - bucket.lastRefill) / 1000;
    const tokensToAdd = elapsedSeconds * REFILL_RATE;
    bucket.tokens = Math.min(LIMIT, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;
  }

  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    buckets.set(ip, bucket);
    
    return {
      success: true,
      limit: LIMIT,
      remaining: Math.floor(bucket.tokens),
      reset: Math.ceil(((LIMIT - bucket.tokens) / REFILL_RATE)),
    };
  }

  // Not enough tokens
  return {
    success: false,
    limit: LIMIT,
    remaining: 0,
    reset: Math.ceil(((1 - bucket.tokens) / REFILL_RATE)),
  };
}
