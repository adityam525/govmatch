import { prisma } from '@/lib/prisma';
import { monthRange, type CalendarEvent } from '@/lib/exam-calendar';

const RECENT_MS = 30 * 86_400_000;

// Schedule events of published, non-cancelled jobs in a month. Pass job ids to limit it to those jobs.
export async function loadCalendarEvents(month: string, jobIds?: string[]): Promise<CalendarEvent[] | null> {
  const range = monthRange(month);
  if (!range) return null;
  if (jobIds && jobIds.length === 0) return [];
  const rows = await prisma.scheduleEvent.findMany({
    where: {
      at: { gte: range.start, lt: range.end },
      notification: { published: true, status: { not: 'CANCELLED' }, ...(jobIds ? { id: { in: jobIds } } : {}) },
    },
    orderBy: { at: 'asc' },
    take: 1000,
    select: {
      id: true, kind: true, label: true, at: true, timeKnown: true,
      notification: { select: { title: true, slug: true } },
      history: { select: { kind: true, createdAt: true } },
    },
  });
  const now = Date.now();
  return rows.flatMap((r) => (r.at ? [{
    id: r.id, kind: r.kind, label: r.label, at: r.at.toISOString(), timeKnown: r.timeKnown,
    jobTitle: r.notification.title, jobSlug: r.notification.slug,
    postponed: r.history.some((h) => h.kind === 'POSTPONED' && now - h.createdAt.getTime() < RECENT_MS),
  }] : []));
}
