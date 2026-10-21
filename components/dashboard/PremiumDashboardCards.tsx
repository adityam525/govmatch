'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BellRing } from 'lucide-react';
import Card from '@/components/ui/Card';
import { useAuth } from '@/features/auth/hooks';
import { daysBetween, formatShortDate, todayIST } from '@/lib/job-status';

interface SavedJob {
  id: string;
  title: string;
  slug: string;
  status: string;
  published: boolean;
  applicationEndDate: string | null;
  organization?: { name: string } | null;
}

const WINDOW_DAYS = 14;

function dueLabel(days: number): string {
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `${days} days left`;
}

// Shown to Premium users only: saved jobs that close in the next two weeks.
export default function PremiumDashboardCards() {
  const { user } = useAuth();
  const [premium, setPremium] = useState(false);
  const [jobs, setJobs] = useState<SavedJob[] | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;

    (async () => {
      try {
        const status = await fetch(`/api/users/${user.id}/status`).then((r) => r.json());
        if (cancelled || !status?.premium) return;
        setPremium(true);
        const saved = await fetch(`/api/users/${user.id}/saved-jobs`).then((r) => r.json());
        if (!cancelled) setJobs(Array.isArray(saved) ? saved : []);
      } catch {
        // The card is a bonus; if it cannot load it simply stays hidden.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  if (!premium || jobs === null) return null;

  const today = todayIST();
  const due = jobs
    .filter((job) => job.published && job.status !== 'CLOSED' && job.status !== 'CANCELLED' && job.applicationEndDate)
    .map((job) => ({ job, days: daysBetween(today, new Date(job.applicationEndDate as string)) }))
    .filter(({ days }) => days >= 0 && days <= WINDOW_DAYS)
    .sort((a, b) => a.days - b.days);

  return (
    <Card padding="lg">
      <div className="mb-3 flex items-center gap-2">
        <BellRing size={16} className="text-primary-600" />
        <h2 className="text-sm font-bold text-neutral-900">Deadline reminders</h2>
        <span className="text-xs text-neutral-400">saved jobs closing within {WINDOW_DAYS} days</span>
      </div>

      {due.length === 0 ? (
        <p className="text-xs text-neutral-500">
          Nothing closing soon.{' '}
          <Link href="/saved-jobs" className="text-primary-600 hover:underline">
            View saved jobs
          </Link>
        </p>
      ) : (
        <div className="divide-y divide-neutral-100">
          {due.map(({ job, days }) => (
            <Link key={job.id} href={`/jobs/${job.slug}`} className="flex items-center justify-between gap-3 py-2.5 first:pt-0">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-neutral-900">{job.title}</p>
                <p className="truncate text-xs text-neutral-500">
                  {job.organization?.name} · last date {formatShortDate(job.applicationEndDate)}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                  days <= 2 ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-700'
                }`}
              >
                {dueLabel(days)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
}
