'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import OrgLogo from '@/components/shared/OrgLogo';

interface RecentJobsSidebarProps {
  excludeSlug?: string;
}

const MAX_JOBS = 20;

export default function RecentJobsSidebar({ excludeSlug }: RecentJobsSidebarProps) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/notifications')
      .then((res) => res.json())
      .then((data) => setNotifications(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const recentJobs = notifications
    .filter((n) => n.published && n.slug !== excludeSlug)
    .filter((n) => {
      if (n.status === 'CLOSED' || n.status === 'CANCELLED') return false;
      if (!n.applicationEndDate) return true;
      return new Date(n.applicationEndDate).getTime() >= Date.now() - 1000 * 60 * 60 * 24;
    })
    .slice(0, MAX_JOBS);

  return (
    <section className="flex h-96 flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm lg:h-[calc(100dvh-8.5rem)] lg:max-h-[60rem]">
      <h2 className="shrink-0 border-b border-neutral-100 px-4 py-3 text-sm font-bold text-neutral-900">
        Recently Posted Jobs
      </h2>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {loading ? (
          <p className="py-6 text-center text-xs text-neutral-400">Loading...</p>
        ) : recentJobs.length === 0 ? (
          <p className="px-4 py-6 text-center text-xs text-neutral-400">No other jobs available.</p>
        ) : (
          <div className="divide-y divide-neutral-100">
            {recentJobs.map((job) => (
              <Link
                key={job.id}
                href={`/jobs/${job.slug}`}
                className="flex items-start gap-2.5 px-4 py-3 transition-colors hover:bg-neutral-50"
              >
                <OrgLogo
                  name={job.organization?.name ?? 'Organization'}
                  shortName={job.organization?.shortName}
                  logoUrl={job.organization?.logoUrl}
                  size={32}
                />
                <div className="min-w-0">
                  <p className="line-clamp-2 text-xs font-semibold leading-tight text-neutral-900">{job.title}</p>
                  <p className="mt-1 truncate text-[10px] text-neutral-400">{job.organization?.name}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Link
        href="/jobs"
        className="shrink-0 border-t border-neutral-100 px-4 py-3 text-center text-xs font-medium text-primary-600 hover:underline"
      >
        View all jobs
      </Link>
    </section>
  );
}
