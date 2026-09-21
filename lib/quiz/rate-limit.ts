/**
 * Fixed-window limiter held in process memory.
 *
 * Deliberately NOT keyed on IP: at a conference every attendee shares the
 * venue's NAT, so an IP limit would lock out the whole queue after a few
 * sign-ups. It is a coarse burst guard only.
 *
 * Caveat: on serverless each instance keeps its own counters, so the effective
 * limit scales with instance count and resets on cold start. It stops a naive
 * flood from one client; it is not a substitute for a durable limiter
 * (Upstash/Redis) or a captcha if the endpoint is ever seriously targeted.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const MAX_TRACKED_KEYS = 5000;

function prune(now: number) {
  for (const [key, bucket] of buckets) {
    if (now >= bucket.resetAt) {
      buckets.delete(key);
    }
  }
}

export function consumeRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();

  if (buckets.size > MAX_TRACKED_KEYS) {
    prune(now);
  }

  const bucket = buckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (bucket.count >= limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000))
    };
  }

  bucket.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}
