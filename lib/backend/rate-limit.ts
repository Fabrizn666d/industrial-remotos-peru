type RateLimitEntry = { count: number; resetAt: number };

const globalRateLimit = globalThis as typeof globalThis & {
  __irpRateLimitStore?: Map<string, RateLimitEntry>;
};

const store = globalRateLimit.__irpRateLimitStore ?? new Map<string, RateLimitEntry>();
globalRateLimit.__irpRateLimitStore = store;

export function consumeRateLimit(key: string, maximum: number, windowMilliseconds: number) {
  const now = Date.now();
  const existing = store.get(key);
  const entry = !existing || existing.resetAt <= now
    ? { count: 1, resetAt: now + windowMilliseconds }
    : { count: existing.count + 1, resetAt: existing.resetAt };
  store.set(key, entry);

  if (store.size > 2_000) {
    for (const [storedKey, value] of store) {
      if (value.resetAt <= now) store.delete(storedKey);
    }
  }

  return {
    allowed: entry.count <= maximum,
    remaining: Math.max(0, maximum - entry.count),
    retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - now) / 1000))
  };
}

export function requestClientKey(request: Request) {
  const realIp = request.headers.get("x-real-ip")?.trim();
  const forwardedIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return realIp || forwardedIp || "unknown";
}
