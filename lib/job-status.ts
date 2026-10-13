// Derives a job's lifecycle phase from its dates and results, so nobody has to
// flip a status by hand.
//
//   UPCOMING   applications have not opened yet (or: announced, dates still awaited)
//   LIVE       from the day applications open until the FINAL result is declared
//   CLOSED     final result declared, or closed manually
//   CANCELLED  set manually
//
// There is deliberately no timer: some recruitments take years, so a job stays
// LIVE until a FINAL result is recorded or an admin closes it. Use
// `applicationOpen` to tell "accepting applications" from "in progress".
//
// The stored `status` column is read like this: LIVE and UPCOMING mean "work it
// out from the dates"; CLOSED and CANCELLED are manual overrides that always win.

export type JobPhase = 'UPCOMING' | 'LIVE' | 'CLOSED' | 'CANCELLED';
export type PhaseTab = 'live' | 'upcoming' | 'closed';

const DAY_MS = 24 * 60 * 60 * 1000;

type DateLike = Date | string | null | undefined;

export interface PhaseInput {
  status: string;
  notificationDate?: DateLike;
  applicationStartDate?: DateLike;
  applicationEndDate?: DateLike;
  examDate?: DateLike;
  importantDates?: { date: DateLike }[];
  admitCards?: { releaseDate?: DateLike; examDate?: DateLike }[];
  results?: { resultType: string; releaseDate?: DateLike }[];
  answerKeys?: { releaseDate?: DateLike; objectionEndDate?: DateLike }[];
}

export interface JobPhaseInfo {
  phase: JobPhase;
  applicationOpen: boolean;
  lastActivity: Date | null;
}

const toDate = (value: DateLike): Date | null => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

// Dates are stored as UTC midnight of the calendar date the admin picked, so
// "today" is today's calendar date in India expressed as UTC midnight.
export function todayIST(now: Date = new Date()): Date {
  const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  return new Date(`${ist.toISOString().slice(0, 10)}T00:00:00.000Z`);
}

export function daysBetween(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / DAY_MS);
}

export function formatCalendarDate(date: DateLike): string {
  const d = toDate(date);
  if (!d) return 'TBA';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

// Short form for list rows: "15 Oct", with the year only when it isn't this year.
export function formatShortDate(date: DateLike, now: Date = new Date()): string {
  const d = toDate(date);
  if (!d) return 'TBA';
  const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', timeZone: 'UTC' };
  if (d.getUTCFullYear() !== todayIST(now).getUTCFullYear()) options.year = 'numeric';
  return d.toLocaleDateString('en-IN', options);
}

export function phaseToTab(phase: JobPhase): PhaseTab {
  if (phase === 'LIVE') return 'live';
  if (phase === 'UPCOMING') return 'upcoming';
  return 'closed';
}

export function computeJobPhase(job: PhaseInput, now: Date = new Date()): JobPhaseInfo {
  const today = todayIST(now);
  const start = toDate(job.applicationStartDate);
  const end = toDate(job.applicationEndDate);

  const known = [
    job.notificationDate,
    job.applicationStartDate,
    job.applicationEndDate,
    job.examDate,
    ...(job.importantDates ?? []).map((d) => d.date),
    ...(job.admitCards ?? []).flatMap((a) => [a.releaseDate, a.examDate]),
    ...(job.results ?? []).map((r) => r.releaseDate),
    ...(job.answerKeys ?? []).flatMap((k) => [k.releaseDate, k.objectionEndDate]),
  ]
    .map((value) => toDate(value))
    .filter((d): d is Date => d !== null);

  const lastActivity = known.length > 0 ? new Date(Math.max(...known.map((d) => d.getTime()))) : null;
  const result = (phase: JobPhase, applicationOpen = false): JobPhaseInfo => ({
    phase,
    applicationOpen,
    lastActivity,
  });

  if (job.status === 'CANCELLED') return result('CANCELLED');
  if (job.status === 'CLOSED') return result('CLOSED');

  const finalDeclared = (job.results ?? []).some((r) => {
    if (r.resultType !== 'FINAL') return false;
    const released = toDate(r.releaseDate);
    return !released || released <= today;
  });
  if (finalDeclared) return result('CLOSED');

  if (start && start > today) return result('UPCOMING');
  if (!start && job.status === 'UPCOMING') return result('UPCOMING');

  return result('LIVE', end ? end >= today : true);
}
