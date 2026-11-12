'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import OrgLogo from '@/components/shared/OrgLogo';

interface RecentJobsSidebarProps {
  excludeSlug?: string;
}

const MAX_ROWS = 40;
const MAX_POSTS_PER_NOTICE = 5;

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

  const rows = notifications
    .filter((n) => n.published && n.slug !== excludeSlug)
    .filter((n) => {
      if (n.status === 'CLOSED' || n.status === 'CANCELLED') return false;
      if (!n.applicationEndDate) return true;
      return new Date(n.applicationEndDate).getTime() >= Date.now() - 1000 * 60 * 60 * 24;
    })
    .flatMap((job) => {
      const posts: any[] = Array.isArray(job.posts) ? job.posts : [];
      if (posts.length === 0) return [{ key: job.id, job, heading: job.title as string, notice: null as string | null }];
      return posts.slice(0, MAX_POSTS_PER_NOTICE).map((post) => ({ key: job.id + ':' + post.id, job, heading: post.title as string, notice: job.title as string }));
    })
    .slice(0, MAX_ROWS);

  return (
    <section className="flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm lg:h-[calc(100dvh-8.5rem)] lg:max-h-[60rem]">
      <h2 className="shrink-0 border-b border-neutral-100 px-4 py-3 text-sm font-bold text-neutral-900">Recently Posted Jobs</h2>

      <div className="min-h-0 flex-1 lg:overflow-y-auto lg:overscroll-contain">
        {loading ? (
          <p className="py-6 text-center text-xs text-neutral-500">Loading...</p>
        ) : rows.length === 0 ? (
          <p className="px-4 py-6 text-center text-xs text-neutral-500">No other jobs available.</p>
        ) : (
          <div className="divide-y divide-neutral-100">
            {rows.map(({ key, job, heading, notice }, i) => (
              <Link key={key} href={`/jobs/${job.slug}`} className={"items-start gap-2.5 px-4 py-3 transition-colors hover:bg-neutral-50 " + (i >= 6 ? "hidden lg:flex" : "flex")}>
                <OrgLogo name={job.organization?.name ?? 'Organization'} shortName={job.organization?.shortName} logoUrl={job.organization?.logoUrl} size={32} />
                <div className="min-w-0">
                  <p className="line-clamp-2 text-xs font-semibold leading-tight text-neutral-900">{heading}</p>
                  <p className="mt-1 truncate text-3xs text-neutral-500">{[notice, job.organization?.name].filter(Boolean).join(' · ')}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Link href="/jobs" className="shrink-0 border-t border-neutral-100 px-4 py-3 text-center text-xs font-medium text-primary-600 hover:underline">View all jobs</Link>
    </section>
  );
}
