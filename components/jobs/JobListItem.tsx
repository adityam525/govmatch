import Link from "next/link";
import {
  Building2,
  ChevronRight,
  Crown,
  Landmark,
  Shield,
  TrainFront,
  Users,
} from "lucide-react";

import Button from "@/components/ui/Button";
import JobMetaChip from "@/components/jobs/JobMetaChip";
import type { Job } from "@/features/jobs/types";

const iconMap = {
  crown: Crown,
  train: TrainFront,
  landmark: Landmark,
  shield: Shield,
} as const;

const categoryLabels: Record<Job["category"], string> = {
  central: "Central Govt",
  state: "State Govt",
  banking: "Banking",
  defence: "Defence",
  psu: "PSU",
  teaching: "Teaching",
};

const categoryStyles: Record<Job["category"], string> = {
  central: "bg-sky-50 border-sky-200 text-sky-700 group-hover:bg-sky-100",
  state:
    "bg-violet-50 border-violet-200 text-violet-700 group-hover:bg-violet-100",
  banking:
    "bg-green-50 border-green-200 text-green-700 group-hover:bg-green-100",
  defence: "bg-red-50 border-red-200 text-red-700 group-hover:bg-red-100",
  psu: "bg-amber-50 border-amber-200 text-amber-700 group-hover:bg-amber-100",
  teaching:
    "bg-indigo-50 border-indigo-200 text-indigo-700 group-hover:bg-indigo-100",
};

interface JobListItemProps {
  job: Job;
  matchPercentage?: number;
}

export default function JobListItem({
  job,
  matchPercentage,
}: JobListItemProps) {
  const Icon = iconMap[job.orgIconName] ?? Building2;

  return (
    <article className="group rounded-xl border border-neutral-200 bg-white px-5 py-4 transition-all duration-200 hover:border-primary-200 hover:shadow-sm">
      <div className="flex items-start gap-4">
        {/* Organization */}
        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border transition-all duration-200 ${categoryStyles[job.category]}`}
        >
          <Icon size={22} />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-6">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3
                  title={job.title}
                  className="line-clamp-2 text-[15px] font-semibold leading-6 text-neutral-900 group-hover:text-primary-700"
                >
                  {job.title}
                </h3>

                {matchPercentage !== undefined && (
                  <span className="rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-semibold text-green-700">
                    {matchPercentage}% Match
                  </span>
                )}
              </div>

              <p className="mt-1 text-sm text-neutral-600">{job.org}</p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <JobMetaChip icon={Users}>
                  {job.vacancies.toLocaleString("en-IN")} Posts
                </JobMetaChip>

                <JobMetaChip icon={Building2}>
                  {categoryLabels[job.category]}
                </JobMetaChip>
              </div>
            </div>

            {/* Right */}
            <div className="hidden shrink-0 text-right md:block">
              <p className="text-sm font-semibold text-danger">
                {job.lastDate}
              </p>

              <Link href={`/jobs/${job.slug}`} className="mt-3 inline-block">
                <Button
                  variant="secondary"
                  size="sm"
                  className="min-w-[115px]"
                  icon={<ChevronRight size={15} />}
                  iconPosition="right"
                >
                  View Details
                </Button>
              </Link>
            </div>
          </div>

          {/* Mobile */}
          <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3 md:hidden">
            <p className="text-sm font-semibold text-danger">{job.lastDate}</p>

            <Link href={`/jobs/${job.slug}`}>
              <Button
                variant="secondary"
                size="sm"
                icon={<ChevronRight size={15} />}
                iconPosition="right"
              >
                View
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
