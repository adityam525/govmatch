import Link from 'next/link';
import { Crown, TrainFront, Landmark, Shield, Building2 } from 'lucide-react';
import Button from '@/components/ui/Button';

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  crown: Crown,
  train: TrainFront,
  landmark: Landmark,
  shield: Shield,
};

export interface JobCardData {
  id: string;
  title: string;
  org: string;
  orgIconName: string;
  slug: string;
  vacancies: number;
  lastDate: string;
  daysLeft: number | null;
  payScale: string | null;
  qualificationName: string | null;
  badge: 'NEW' | 'HOT' | null;
}

interface JobCardProps {
  job: JobCardData;
}

export default function JobCard({ job }: JobCardProps) {
  const Icon = iconMap[job.orgIconName] ?? Building2;

  const daysLeftLabel =
    job.daysLeft === null
      ? null
      : job.daysLeft < 0
      ? 'Closed'
      : job.daysLeft === 0
      ? 'Closing today'
      : `${job.daysLeft} days left`;

  const daysLeftColor =
    job.daysLeft === null ? 'text-neutral-400' : job.daysLeft <= 3 ? 'text-danger' : 'text-success';

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-4 flex flex-col h-full hover:shadow-md hover:border-neutral-300 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="w-11 h-11 rounded-lg bg-neutral-50 border border-neutral-100 flex items-center justify-center">
          <Icon size={20} className="text-neutral-600" />
        </div>
        {job.badge && (
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              job.badge === 'NEW' ? 'bg-green-50 text-success' : 'bg-orange-50 text-accent-orange'
            }`}
          >
            {job.badge}
          </span>
        )}
      </div>

      <p className="text-sm font-semibold text-neutral-900 leading-snug line-clamp-2" title={job.title}>
        {job.title}
      </p>
      <p className="text-xs text-neutral-400 mt-1">{job.org}</p>

      {job.payScale && (
        <p className="text-xs font-medium text-neutral-600 mt-2">{job.payScale}</p>
      )}

      {job.qualificationName && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          <span className="text-[10px] bg-neutral-100 text-neutral-600 px-2 py-1 rounded-full">
            {job.qualificationName}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-100">
        <div>
          <p className="text-sm font-bold text-neutral-900">{job.vacancies.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-neutral-400">Vacancies</p>
        </div>
        {daysLeftLabel && (
          <p className={`text-[11px] font-medium ${daysLeftColor}`}>{daysLeftLabel}</p>
        )}
      </div>

      <Link href={`/jobs/${job.slug}`} className="mt-3">
        <Button variant="secondary" size="sm" fullWidth>View Details</Button>
      </Link>
    </div>
  );
}
