'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Crown, TrainFront, Landmark, Shield, Building2 } from 'lucide-react';
import Card from '@/components/ui/Card';

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  crown: Crown,
  train: TrainFront,
  landmark: Landmark,
  shield: Shield,
};

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
    .filter((n) => n.slug !== excludeSlug)
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
          {recentJobs.map((job) => {
            const orgIconMap: Record<string, string> = {
              SSC: 'crown', RRB: 'train', IBPS: 'landmark', UPSC: 'crown',
              IAF: 'shield', NAVY: 'shield', DSSSB: 'landmark', ISRO: 'shield', IOCL: 'shield',
            };
            const iconKey = orgIconMap[job.organization?.shortName] ?? 'shield';
            const Icon = iconMap[iconKey] ?? Building2;

            return (
              <Link
                key={job.id}
                href={`/jobs/${job.slug}`}
                className="flex items-start gap-2.5 p-2.5 rounded-md hover:bg-neutral-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-md bg-neutral-100 flex items-center justify-center shrink-0">
                  <Icon size={16} className="text-neutral-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-neutral-900 leading-tight line-clamp-2">{job.title}</p>
                  <p className="text-[10px] text-neutral-400 mt-1">{job.organization?.name}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </Card>
  );
}
