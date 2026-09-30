/**
 * Client-side rate limiter to protect sensitive actions (login, signup, booking)
 * against rapid brute-force submissions and automated flooding.
 */

interface RateLimitRecord {
  timestamps: number[];
}

export function checkRateLimit(
  actionKey: string,
  maxAttempts: number = 5,
  windowSeconds: number = 300
): { allowed: boolean; remainingSeconds?: number } {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const storageKey = `localverity_rate_${actionKey}`;

  try {
    const raw = localStorage.getItem(storageKey);
    let record: RateLimitRecord = raw ? JSON.parse(raw) : { timestamps: [] };

    // Filter out timestamps outside the sliding window
    record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

    if (record.timestamps.length >= maxAttempts) {
      const oldest = record.timestamps[0];
      const remainingMs = windowMs - (now - oldest);
      const remainingSeconds = Math.ceil(remainingMs / 1000);
      return { allowed: false, remainingSeconds: Math.max(1, remainingSeconds) };
    }

    return { allowed: true };
  } catch {
    return { allowed: true };
  }
}

export function recordAttempt(actionKey: string, windowSeconds: number = 300): void {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const storageKey = `localverity_rate_${actionKey}`;

  try {
    const raw = localStorage.getItem(storageKey);
    let record: RateLimitRecord = raw ? JSON.parse(raw) : { timestamps: [] };

    record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);
    record.timestamps.push(now);

    localStorage.setItem(storageKey, JSON.stringify(record));
  } catch {
    // Ignore localStorage write failures
  }
}

export function resetRateLimit(actionKey: string): void {
  try {
    localStorage.removeItem(`localverity_rate_${actionKey}`);
  } catch {
    // Ignore
  }
}
