'use client';

import { useState, useEffect } from 'react';
import SectionHeader from '@/components/ui/SectionHeader';
import JobCard, { JobCardData } from '@/components/jobs/JobCard';
import TabFilterBar from './TabFilterBar';
import ViewAllBanner from '@/components/shared/ViewAllBanner';

const orgIconMap: Record<string, string> = {
  SSC: 'crown', RRB: 'train', IBPS: 'landmark', UPSC: 'crown',
  IAF: 'shield', NAVY: 'shield', DSSSB: 'landmark', ISRO: 'shield', IOCL: 'shield',
};

const categoryMap: Record<string, string> = {
  ssc: 'central', railway: 'central', banking: 'banking', upsc: 'central',
  'state-government': 'state', defence: 'defence', psu: 'psu', 'police-security': 'defence', teaching: 'teaching', healthcare: 'central', 'judiciary-law': 'central', agriculture: 'central',
};

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function isRecentlyPosted(createdAt: string): boolean {
  const diff = Date.now() - new Date(createdAt).getTime();
  return diff < 1000 * 60 * 60 * 24 * 14; // within 14 days
}

export default function LatestJobsSection() {
  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/notifications')
      .then((res) => res.json())
      .then((data) => setNotifications(Array.isArray(data) ? data : []))
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  }, []);

  const cards: JobCardData[] = notifications.flatMap((n) => {
    const category = categoryMap[n.organization?.category?.slug] ?? 'central';
    if (activeTab !== 'all' && category !== activeTab) return [];

    const daysLeft = daysUntil(n.applicationEndDate);
    const badge: 'NEW' | 'HOT' | null = isRecentlyPosted(n.createdAt)
      ? 'NEW'
      : daysLeft !== null && daysLeft <= 3 && daysLeft >= 0
      ? 'HOT'
      : null;

    const lastDate = n.applicationEndDate
      ? new Date(n.applicationEndDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      : 'TBA';

    if (!n.posts || n.posts.length === 0) {
      return [{
        id: n.id,
        title: n.title,
        org: n.organization?.name ?? 'Unknown',
        orgIconName: orgIconMap[n.organization?.shortName] ?? 'shield',
        slug: n.slug,
        vacancies: n.totalVacancies ?? 0,
        lastDate,
        daysLeft,
        payScale: null,
        qualificationName: null,
        badge,
      }];
    }

    return n.posts.map((post: any) => ({
      id: post.id,
      title: `${n.title} - ${post.title}`,
      org: n.organization?.name ?? 'Unknown',
      orgIconName: orgIconMap[n.organization?.shortName] ?? 'shield',
      slug: n.slug,
      vacancies: post.vacancies ?? 0,
      lastDate,
      daysLeft,
      payScale: post.payScale ?? null,
      qualificationName: post.qualification?.name ?? null,
      badge,
    }));
  });

  return (
    <section>
      <SectionHeader
        title="Latest Government Job Notifications"
        description="Freshly published openings, verified against official sources"
        viewAllHref="/jobs"
      />
      <TabFilterBar activeTab={activeTab} onChange={setActiveTab} />

      <div className="mt-4 overflow-y-auto" style={{ maxHeight: '1088px' }}>
        {loading ? (
          <p className="text-sm text-neutral-400 py-6 text-center">Loading...</p>
        ) : cards.length === 0 ? (
          <p className="text-sm text-neutral-400 py-6 text-center">No jobs found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-1">
            {cards.map((card) => (
              <JobCard key={card.id} job={card} />
            ))}
          </div>
        )}
      </div>

      <ViewAllBanner href="/jobs" label="View All Latest Jobs" />
    </section>
  );
}
