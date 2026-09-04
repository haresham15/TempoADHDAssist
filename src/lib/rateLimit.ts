const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

const RATE_LIMIT = 10; // requests
const WINDOW_MS = 60 * 1000; // per minute
const MAX_MAP_SIZE = 1000;

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const firstIp = forwarded.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }
  return req.headers.get("x-real-ip") || "unknown";
}

export function checkRateLimit(ip: string): boolean {
  const now = Date.now();

  // Periodic pruning of expired entries to prevent memory leaks
  if (rateLimitMap.size > 500) {
    for (const [key, record] of rateLimitMap.entries()) {
      if (now - record.lastReset > WINDOW_MS) {
        rateLimitMap.delete(key);
      }
    }
  }

  // Hard safety cap: if still too large, evict oldest entries
  if (rateLimitMap.size >= MAX_MAP_SIZE) {
    const keysToDelete = Array.from(rateLimitMap.keys()).slice(0, 200);
    for (const key of keysToDelete) {
      rateLimitMap.delete(key);
    }
  }

  const record = rateLimitMap.get(ip);

  if (!record) {
    rateLimitMap.set(ip, { count: 1, lastReset: now });
    return true;
  }

  if (now - record.lastReset > WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, lastReset: now });
    return true;
  }

  if (record.count >= RATE_LIMIT) {
    return false;
  }

  record.count += 1;
  return true;
}
