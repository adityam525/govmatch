import Link from 'next/link';
import { Crown, TrainFront, Landmark, Shield, Building2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import type { Job } from '@/features/jobs/types';

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  crown: Crown,
  train: TrainFront,
  landmark: Landmark,
  shield: Shield,
};

interface JobListItemProps {
  job: Job;
}

export default function JobListItem({ job }: JobListItemProps) {
  const Icon = iconMap[job.orgIconName] ?? Building2; // safe fallback, never undefined

  return (
    <div className="flex items-center justify-between py-4 border-b border-neutral-100 last:border-0">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-neutral-100 shrink-0">
          <Icon size={20} className="text-neutral-600" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-neutral-900 truncate">{job.title}</p>
          <p className="text-xs text-neutral-600 truncate">{job.org}</p>
        </div>
      </div>

      <div className="hidden sm:block text-right shrink-0 px-4">
        <p className="text-sm font-semibold text-neutral-900">{job.vacancies.toLocaleString('en-IN')}</p>
        <p className="text-xs text-neutral-400">Vacancies</p>
      </div>

      <div className="hidden sm:block text-right shrink-0 px-4">
        <p className="text-sm font-semibold text-danger">{job.lastDate}</p>
        <p className="text-xs text-neutral-400">Last Date</p>
      </div>

      <Link href={`/jobs/${job.slug}`} className="shrink-0">
        <Button variant="secondary" size="sm">View Details</Button>
      </Link>
    </div>
  );
}
