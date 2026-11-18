export const MAX_FAILS = 5;
export const LOCK_MS = 15 * 60 * 1000;

// What to store after a wrong password: count up, and lock after MAX_FAILS in a row.
export function afterFailure(failed: number, now: number): { failedAttempts: number; lockedUntil: Date | null } {
  const n = failed + 1;
  return n >= MAX_FAILS ? { failedAttempts: 0, lockedUntil: new Date(now + LOCK_MS) } : { failedAttempts: n, lockedUntil: null };
}
export const isLocked = (until: Date | null, now: number) => !!until && until.getTime() > now;
export const minutesLeft = (until: Date, now: number) => Math.max(1, Math.ceil((until.getTime() - now) / 60000));
