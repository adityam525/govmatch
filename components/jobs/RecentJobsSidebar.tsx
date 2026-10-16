'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import OrgLogo from '@/components/shared/OrgLogo';

interface RecentJobsSidebarProps {
  excludeSlug?: string;
}

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
    .slice(0, 8);

  return (
    <Card padding="lg">
      <h2 className="text-sm font-bold text-neutral-900 mb-4">Recently Posted Jobs</h2>

      {loading ? (
        <p className="text-xs text-neutral-400 py-4 text-center">Loading...</p>
      ) : recentJobs.length === 0 ? (
        <p className="text-xs text-neutral-400 py-4 text-center">No other jobs available.</p>
      ) : (
        <div className="space-y-1">
          {recentJobs.map((job) => (
            <Link
              key={job.id}
              href={`/jobs/${job.slug}`}
              className="flex items-start gap-2.5 p-2.5 rounded-md hover:bg-neutral-50 transition-colors"
            >
              <OrgLogo
                name={job.organization?.name ?? 'Organization'}
                shortName={job.organization?.shortName}
                logoUrl={job.organization?.logoUrl}
                size={32}
              />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-neutral-900 leading-tight line-clamp-2">{job.title}</p>
                <p className="text-[10px] text-neutral-400 mt-1">{job.organization?.name}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
}
