import { getPublishedJobs, type PublishedJob } from '@/lib/job-queries';
import { daysBetween, todayIST } from '@/lib/job-status';
import HotNewsMarquee, { type HotItemView } from './HotNewsMarquee';

const DAY_MS = 24 * 60 * 60 * 1000;

type RankedItem = HotItemView & { rank: number };

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

// One item per job, in priority order: last date today, closing within 3 days,
// admit card out with the exam within a week, result declared in the last 3 days.
function hotItemFor(job: PublishedJob, today: Date): RankedItem | null {
  const base = { key: job.id, title: job.title, href: `/jobs/${job.slug}` };

  if (job.phase === 'LIVE' && job.applicationOpen && job.applicationEndDate) {
    const left = daysBetween(today, job.applicationEndDate);
    if (left === 0) return { ...base, tone: 'urgent', label: 'Last date today', rank: 0 };
    if (left <= 3) return { ...base, tone: 'urgent', label: `Closes in ${plural(left, 'day')}`, rank: left };
  }

  if (job.phase === 'LIVE' || job.phase === 'UPCOMING') {
    const upcomingExams = job.admitCards
      .filter((card) => card.downloadLink)
      .map((card) => card.examDate ?? job.examDate)
      .filter((d): d is Date => d !== null && d >= today)
      .sort((a, b) => a.getTime() - b.getTime());
    if (upcomingExams.length > 0) {
      const days = daysBetween(today, upcomingExams[0]);
      if (days <= 7) {
        const when = days === 0 ? 'exam today' : days === 1 ? 'exam tomorrow' : `exam in ${days} days`;
        return { ...base, tone: 'info', label: `Admit card out - ${when}`, rank: 20 + days };
      }
    }
  }

  const threeDaysAgo = new Date(today.getTime() - 3 * DAY_MS);
  const freshResult = job.results.some(
    (result) => result.resultLink && (result.releaseDate ?? result.createdAt) >= threeDaysAgo,
  );
  if (freshResult && job.phase !== 'CANCELLED') {
    return { ...base, tone: 'info', label: 'Result declared', rank: 10 };
  }

  return null;
}

export default async function HotNewsBanner({ limit = 12, sticky = false }: { limit?: number; sticky?: boolean }) {
  // This sits in shared layouts. A database hiccup must never take down pages
  // that otherwise don't need the database, so it fails quietly.
  let jobs: PublishedJob[];
  try {
    jobs = await getPublishedJobs();
  } catch (error) {
    console.error('HotNewsBanner: could not load jobs', error);
    return null;
  }

  const today = todayIST();
  const items = jobs
    .map((job) => hotItemFor(job, today))
    .filter((item): item is RankedItem => item !== null)
    .sort((a, b) => a.rank - b.rank)
    .slice(0, limit)
    .map(({ rank: _rank, ...item }) => item);

  if (items.length === 0) return null;
  return <HotNewsMarquee items={items} sticky={sticky} />;
}
