// Basic per-IP rate limiter (use Redis in production)
const hits = new Map<string, { count: number; ts: number }>();


export function rateLimit(key: string, windowMs = 60_000, limit = 30) {
    const now = Date.now();
    const item = hits.get(key);
    if (!item || now - item.ts > windowMs) {
        hits.set(key, { count: 1, ts: now });
        return { allowed: true };
    }
    item.count++;
    if (item.count > limit) return { allowed: false };
    return { allowed: true };
}