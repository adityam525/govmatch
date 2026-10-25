import { prisma } from '@/lib/prisma';
import { RECENT_CHANGE_DAYS, describeChange, formatShortMoment, isRecent, kindLabel } from '@/lib/schedule';

const DAY_MS = 24 * 60 * 60 * 1000;

export interface JobScheduleView {
  events: {
    id: string;
    kind: string;
    label: string;
    at: Date | null;
    timeKnown: boolean;
    postponed: boolean;
    lastChange: string | null;
    history: { text: string; when: Date }[];
  }[];
  /** True when any event moved in the last week. */
  recentlyChanged: boolean;
}

export async function getJobSchedule(notificationId: string): Promise<JobScheduleView> {
  const events = await prisma.scheduleEvent.findMany({
    where: { notificationId },
    include: { history: { orderBy: { createdAt: 'asc' } } },
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
  });

  const view = events.map((event) => {
    const moves = event.history.filter((h) => h.kind !== 'ANNOUNCED');
    const latest = moves[moves.length - 1];
    return {
      id: event.id,
      kind: event.kind,
      label: event.label,
      at: event.at,
      timeKnown: event.timeKnown,
      postponed: !!latest && isRecent(latest.createdAt) && (latest.kind === 'POSTPONED' || latest.kind === 'CANCELLED'),
      lastChange: latest ? describeChange(latest) : null,
      history: event.history.map((h) => ({ text: describeChange(h), when: h.createdAt })),
    };
  });

  return { events: view, recentlyChanged: view.some((e) => e.postponed) };
}

/** Job ids whose key dates were postponed in the last week, for the "Postponed" tag. */
export async function getRecentlyPostponedJobIds(): Promise<Set<string>> {
  const since = new Date(Date.now() - RECENT_CHANGE_DAYS * DAY_MS);
  const rows = await prisma.scheduleChange.findMany({
    where: { kind: { in: ['POSTPONED', 'CANCELLED'] }, createdAt: { gte: since } },
    select: { event: { select: { notificationId: true } } },
  });
  return new Set(rows.map((r) => r.event.notificationId));
}

export interface ScheduleNotice {
  jobId: string;
  jobTitle: string;
  jobSlug: string;
  text: string;
  when: Date;
}

/** Recent schedule changes on the user's saved jobs and tracked applications. */
export async function getScheduleNoticesForUser(userId: string, limit = 6): Promise<ScheduleNotice[]> {
  const [saved, applied] = await Promise.all([
    prisma.savedJob.findMany({ where: { userId }, select: { notificationId: true } }),
    prisma.application.findMany({ where: { userId }, select: { notificationId: true } }),
  ]);
  const ids = [...new Set([...saved, ...applied].map((r) => r.notificationId))];
  if (ids.length === 0) return [];

  const since = new Date(Date.now() - 30 * DAY_MS);
  const changes = await prisma.scheduleChange.findMany({
    where: { kind: { not: 'ANNOUNCED' }, createdAt: { gte: since }, event: { notificationId: { in: ids }, notification: { published: true } } },
    include: { event: { select: { label: true, kind: true, notification: { select: { id: true, title: true, slug: true } } } } },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return changes.map((c) => ({
    jobId: c.event.notification.id,
    jobTitle: c.event.notification.title,
    jobSlug: c.event.notification.slug,
    text: `${c.event.label || kindLabel(c.event.kind)}: ${describeChange(c)}`,
    when: c.createdAt,
  }));
}

export { formatShortMoment };
