import { Ratelimit } from '@upstash/ratelimit';
import { kv } from '@vercel/kv';

// A mock ratelimiter for development environment to avoid needing Vercel KV.
// It always allows requests.
class MockRatelimit {
  limit(identifier: string) {
    console.log(`Bypassing rate limit for ${identifier} in development.`);
    return {
      success: true,
      pending: Promise.resolve(),
      limit: 100,
      remaining: 99,
      reset: Date.now() + 10000,
    };
  }
}

// Use the real Vercel KV-based ratelimiter in production,
// and the mock ratelimiter in other environments (like development).
export const ratelimit =
  process.env.NODE_ENV === 'production'
    ? new Ratelimit({
        redis: kv,
        // 10 saniyede 5 istek
        limiter: Ratelimit.slidingWindow(5, '10 s'),
      })
    : new MockRatelimit(); 