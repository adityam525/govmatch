import Link from 'next/link';
import { Flame } from 'lucide-react';
import { getPublishedJobs, type PublishedJob } from '@/lib/job-queries';
import { daysBetween, todayIST } from '@/lib/job-status';

const DAY_MS = 24 * 60 * 60 * 1000;

interface HotItem {
  key: string;
  tone: 'urgent' | 'info';
  label: string;
  title: string;
  href: string;
  rank: number;
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

// One item per job, in priority order: last date today, closing within 3 days,
// admit card out with the exam within a week, result declared in the last 3 days.
function hotItemFor(job: PublishedJob, today: Date): HotItem | null {
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

export default async function HotNewsBanner({ limit = 8 }: { limit?: number }) {
  const today = todayIST();
  const items = (await getPublishedJobs())
    .map((job) => hotItemFor(job, today))
    .filter((item): item is HotItem => item !== null)
    .sort((a, b) => a.rank - b.rank)
    .slice(0, limit);

  if (items.length === 0) return null;

  return (
    <div className="border-b border-amber-200 bg-amber-50">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2 md:px-6">
        <span className="flex shrink-0 items-center gap-1 text-xs font-bold uppercase tracking-wide text-amber-700">
          <Flame size={14} /> Hot
        </span>
        <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors ${
                item.tone === 'urgent'
                  ? 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                  : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              <span className="font-semibold">{item.label}</span>
              <span className="opacity-40">·</span>
              <span className="max-w-[14rem] truncate">{item.title}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
