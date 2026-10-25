// Schedule events: exact moments in IST, with or without a known time.

export const EVENT_KINDS = [
  { code: 'APPLICATION_OPEN', label: 'Applications open' },
  { code: 'APPLICATION_CLOSE', label: 'Applications close' },
  { code: 'ADMIT_CARD', label: 'Admit card' },
  { code: 'EXAM', label: 'Exam' },
  { code: 'RESULT', label: 'Result' },
  { code: 'OTHER', label: 'Other' },
] as const;

export const KIND_CODES = new Set<string>(EVENT_KINDS.map((k) => k.code));
export const kindLabel = (code: string) => EVENT_KINDS.find((k) => k.code === code)?.label ?? code;

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
export const RECENT_CHANGE_DAYS = 7;

/** "2026-11-18" + optional "17:00" (both in IST) to the exact moment. No time means end of that day. */
export function istToDate(day: string, time?: string | null): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return null;
  const hhmm = time && /^([01]\d|2[0-3]):[0-5]\d$/.test(time) ? time : null;
  if (time && !hhmm) return null;
  const date = new Date(`${day}T${hhmm ?? '23:59'}:${hhmm ? '00' : '59'}+05:30`);
  if (Number.isNaN(date.getTime())) return null;
  // Reject impossible days such as 2026-02-31, which JavaScript quietly rolls over.
  if (new Date(date.getTime() + IST_OFFSET_MS).toISOString().slice(0, 10) !== day) return null;
  return date;
}

/** The IST calendar day of a moment, as YYYY-MM-DD. */
export function istDay(date: Date | string): string {
  return new Date(new Date(date).getTime() + IST_OFFSET_MS).toISOString().slice(0, 10);
}

/** The IST clock time of a moment, as HH:MM. */
export function istTime(date: Date | string): string {
  return new Date(new Date(date).getTime() + IST_OFFSET_MS).toISOString().slice(11, 16);
}

/** The day at midnight UTC, which is how the older date columns store a calendar date. */
export function dayAsUtcMidnight(date: Date | string): Date {
  return new Date(`${istDay(date)}T00:00:00.000Z`);
}

export function formatEventMoment(at: Date | string | null | undefined, timeKnown: boolean): string {
  if (!at) return 'Date to be announced';
  const d = new Date(at);
  const day = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' });
  if (!timeKnown) return day;
  const time = d
    .toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' })
    .toUpperCase();
  return `${day}, ${time}`;
}

export function formatShortMoment(at: Date | string | null | undefined, timeKnown: boolean): string {
  if (!at) return 'TBA';
  const d = new Date(at);
  const day = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', timeZone: 'Asia/Kolkata' });
  if (!timeKnown) return day;
  const time = d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' }).toUpperCase();
  return `${day}, ${time}`;
}

export function isRecent(createdAt: Date | string, now: Date = new Date()): boolean {
  return now.getTime() - new Date(createdAt).getTime() < RECENT_CHANGE_DAYS * DAY_MS;
}

interface ChangeLike {
  kind: string;
  oldAt: Date | string | null;
  oldTimeKnown: boolean;
  newAt: Date | string | null;
  newTimeKnown: boolean;
  reason?: string | null;
  createdAt: Date | string;
}

/** A readable sentence for one history row, such as "Postponed from 12 Dec to 3 Jan, 10:00 AM". */
export function describeChange(change: ChangeLike): string {
  const from = formatEventMoment(change.oldAt, change.oldTimeKnown);
  const to = formatEventMoment(change.newAt, change.newTimeKnown);
  const why = change.reason ? ` (${change.reason})` : '';
  switch (change.kind) {
    case 'ANNOUNCED':
      return `Scheduled for ${to}`;
    case 'CANCELLED':
      return `Cancelled${why}`;
    case 'TIME_ADDED':
      return `Time announced: ${to}${why}`;
    case 'PREPONED':
      return `Moved earlier from ${from} to ${to}${why}`;
    case 'POSTPONED':
      return change.newAt
        ? `Postponed from ${from} to ${to}${why}`
        : `Postponed from ${from}. New date to be announced${why}`;
    default:
      return `Changed to ${to}${why}`;
  }
}

/**
 * Decide what kind of change this is. If the day is the same and only a time was added, it is
 * TIME_ADDED. If the day moved, it is PREPONED or POSTPONED. A cleared date is a postponement.
 */
export function classifyChange(
  oldAt: Date | null,
  oldTimeKnown: boolean,
  newAt: Date | null,
  newTimeKnown: boolean,
): 'POSTPONED' | 'PREPONED' | 'TIME_ADDED' | null {
  if (!oldAt && !newAt) return null;
  if (oldAt && !newAt) return 'POSTPONED';
  if (!oldAt && newAt) return 'POSTPONED';
  const a = oldAt as Date;
  const b = newAt as Date;
  if (istDay(a) === istDay(b)) {
    if (!oldTimeKnown && newTimeKnown) return 'TIME_ADDED';
    if (oldTimeKnown && newTimeKnown && a.getTime() !== b.getTime()) {
      return b.getTime() > a.getTime() ? 'POSTPONED' : 'PREPONED';
    }
    if (oldTimeKnown && !newTimeKnown) return null;
    return null;
  }
  return b.getTime() > a.getTime() ? 'POSTPONED' : 'PREPONED';
}

// Which older job column an event keeps in step with, if any.
export const LEGACY_COLUMN: Record<string, 'applicationStartDate' | 'applicationEndDate' | 'examDate' | undefined> = {
  APPLICATION_OPEN: 'applicationStartDate',
  APPLICATION_CLOSE: 'applicationEndDate',
};
