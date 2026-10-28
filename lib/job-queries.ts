import { cache } from 'react';
import { prisma } from '@/lib/prisma';
import { computeJobPhase, formatShortDate, todayIST, type JobPhase } from '@/lib/job-status';

const DAY_MS = 24 * 60 * 60 * 1000;

async function fetchPublishedJobs() {
  return prisma.notification.findMany({
    where: { published: true },
    include: {
      organization: { include: { category: true } },
      states: true,
      posts: { include: { qualification: true, qualifications: true, qualificationRules: true, branches: true, roles: true } },
      importantDates: true,
      admitCards: true,
      results: true,
      answerKeys: true,
      scheduleEvents: { where: { kind: 'APPLICATION_CLOSE' }, select: { at: true, timeKnown: true } },
    },
  });
}

type RawJob = Awaited<ReturnType<typeof fetchPublishedJobs>>[number];

export type PublishedJob = RawJob & {
  phase: JobPhase;
  applicationOpen: boolean;
  lastActivity: Date | null;
  vacancyTotal: number;
};

// Published jobs with their derived phase attached. Cached per request.
export const getPublishedJobs = cache(async (): Promise<PublishedJob[]> => {
  const now = new Date();
  const jobs = await fetchPublishedJobs();
  return jobs.map((job) => {
    const info = computeJobPhase(job, now);
    const postTotal = job.posts.reduce((sum, post) => sum + post.vacancies, 0);
    return {
      ...job,
      phase: info.phase,
      applicationOpen:
        info.applicationOpen &&
        !job.scheduleEvents.some((e) => e.timeKnown && e.at && e.at.getTime() < now.getTime()),
      lastActivity: info.lastActivity,
      vacancyTotal: job.posts.length > 0 ? postTotal : job.totalVacancies,
    };
  });
});

export interface UpdateRow {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  href: string;
}

const isActive = (job: PublishedJob) => job.phase === 'LIVE' || job.phase === 'UPCOMING';
const earliest = (dates: Date[]) => dates.reduce((min, d) => (d < min ? d : min));
const latest = (dates: Date[]) => dates.reduce((max, d) => (d > max ? d : max));

function summarize(titles: string[]): string {
  return titles.length <= 2 ? titles.join(', ') : `${titles.slice(0, 2).join(', ')} +${titles.length - 2} more`;
}

function toRow(job: PublishedJob, detail: string, date: string): UpdateRow {
  return {
    id: job.id,
    title: job.title,
    subtitle: [job.organization?.name, detail].filter(Boolean).join(' - '),
    date,
    href: `/jobs/${job.slug}`,
  };
}

// Jobs whose exam (or any stage's exam) is still ahead, soonest first.
export async function getUpcomingExamRows(limit = 5): Promise<UpdateRow[]> {
  const today = todayIST();
  const rows: { job: PublishedJob; next: Date }[] = [];

  for (const job of await getPublishedJobs()) {
    if (!isActive(job)) continue;
    const future = [job.examDate, ...job.admitCards.map((card) => card.examDate)].filter(
      (d): d is Date => d !== null && d >= today,
    );
    if (future.length > 0) rows.push({ job, next: earliest(future) });
  }

  rows.sort((a, b) => a.next.getTime() - b.next.getTime());
  return rows.slice(0, limit).map(({ job, next }) => toRow(job, '', formatShortDate(next)));
}

// Jobs with an admit card link whose exam is still ahead. If no exam date is
// known anywhere, the card counts when it was released in the last 30 days.
export async function getAdmitCardRows(limit = 5): Promise<UpdateRow[]> {
  const today = todayIST();
  const freshCutoff = new Date(today.getTime() - 30 * DAY_MS);
  const rows: { job: PublishedJob; examAt: Date | null; releasedAt: Date; titles: string[] }[] = [];

  for (const job of await getPublishedJobs()) {
    if (!isActive(job)) continue;

    const cards = job.admitCards.filter((card) => {
      if (!card.downloadLink) return false;
      const examAt = card.examDate ?? job.examDate;
      if (examAt) return examAt >= today;
      return (card.releaseDate ?? card.createdAt) >= freshCutoff;
    });
    if (cards.length === 0) continue;

    const examDates = cards.map((card) => card.examDate ?? job.examDate).filter((d): d is Date => d !== null);
    rows.push({
      job,
      examAt: examDates.length > 0 ? earliest(examDates) : null,
      releasedAt: latest(cards.map((card) => card.releaseDate ?? card.createdAt)),
      titles: cards.map((card) => card.title),
    });
  }

  rows.sort((a, b) => {
    if (a.examAt && b.examAt) return a.examAt.getTime() - b.examAt.getTime();
    if (a.examAt) return -1;
    if (b.examAt) return 1;
    return b.releasedAt.getTime() - a.releasedAt.getTime();
  });

  return rows.slice(0, limit).map(({ job, examAt, releasedAt, titles }) =>
    toRow(job, summarize(titles), examAt ? `Exam ${formatShortDate(examAt)}` : `Out ${formatShortDate(releasedAt)}`),
  );
}

// Jobs with at least one result link, newest result first.
export async function getResultRows(limit = 5): Promise<UpdateRow[]> {
  const rows: { job: PublishedJob; at: Date; titles: string[] }[] = [];

  for (const job of await getPublishedJobs()) {
    if (job.phase === 'CANCELLED') continue;
    const dated = job.results
      .filter((result) => result.resultLink)
      .map((result) => ({ at: result.releaseDate ?? result.createdAt, title: result.title }))
      .sort((a, b) => b.at.getTime() - a.at.getTime());
    if (dated.length === 0) continue;
    rows.push({ job, at: dated[0].at, titles: dated.map((d) => d.title) });
  }

  rows.sort((a, b) => b.at.getTime() - a.at.getTime());
  return rows.slice(0, limit).map(({ job, at, titles }) => toRow(job, summarize(titles), formatShortDate(at)));
}

// Jobs with at least one answer key link, newest first. While an objection
// window is open, that is shown instead of the key's title.
export async function getAnswerKeyRows(limit = 5): Promise<UpdateRow[]> {
  const today = todayIST();
  const rows: { job: PublishedJob; at: Date; detail: string }[] = [];

  for (const job of await getPublishedJobs()) {
    if (job.phase === 'CANCELLED') continue;
    const keys = job.answerKeys.filter((key) => key.downloadLink);
    if (keys.length === 0) continue;

    const dated = keys
      .map((key) => ({ at: key.releaseDate ?? key.createdAt, title: key.title }))
      .sort((a, b) => b.at.getTime() - a.at.getTime());
    const openObjections = keys
      .map((key) => key.objectionEndDate)
      .filter((d): d is Date => d !== null && d >= today);

    rows.push({
      job,
      at: dated[0].at,
      detail:
        openObjections.length > 0
          ? `Objections till ${formatShortDate(earliest(openObjections))}`
          : summarize(dated.map((d) => d.title)),
    });
  }

  rows.sort((a, b) => b.at.getTime() - a.at.getTime());
  return rows.slice(0, limit).map(({ job, at, detail }) => toRow(job, detail, formatShortDate(at)));
}

// Jobs whose applications have not opened yet: soonest start first, jobs with
// no start date yet (dates awaited) last.
export async function getUpcomingJobs(limit?: number): Promise<PublishedJob[]> {
  const jobs = (await getPublishedJobs()).filter((job) => job.phase === 'UPCOMING');
  jobs.sort((a, b) => {
    const aStart = a.applicationStartDate ? a.applicationStartDate.getTime() : Infinity;
    const bStart = b.applicationStartDate ? b.applicationStartDate.getTime() : Infinity;
    if (aStart !== bStart) return aStart - bStart;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });
  return limit ? jobs.slice(0, limit) : jobs;
}
