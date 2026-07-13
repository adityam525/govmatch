import Link from "next/link";
import type { RecommendedJob } from "@/features/jobs/types";

interface RecommendedJobCardProps {
  job: RecommendedJob;
}

function MatchRing({ percent }: { percent: number }) {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative w-12 h-12 shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 48 48">
        <circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="4"
        />
        <circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          stroke="#16a34a"
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[10px] font-bold text-neutral-900">
          {percent}%
        </span>
      </div>
    </div>
  );
}

export default function RecommendedJobCard({ job }: RecommendedJobCardProps) {
  return (
    <Link
      href={`/jobs/${job.slug}`}
      className="flex items-start gap-3 py-3 border-b border-neutral-100 last:border-0 hover:bg-neutral-50 -mx-2 px-2 rounded-md transition-colors"
    >
      <div className="flex items-center justify-center w-9 h-9 rounded-md bg-neutral-100 text-[9px] font-bold text-neutral-600 shrink-0">
        {job.orgLogoText}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-neutral-900 truncate">
          {job.title}
        </p>
        <p className="text-xs text-neutral-400">{job.org}</p>
        <p className="text-xs text-neutral-600 mt-0.5">{job.salaryRange}</p>
        <p className="text-xs text-neutral-400 mt-0.5">
          Last Date: {job.lastDate}
        </p>
      </div>

      <div className="flex flex-col items-center gap-1 shrink-0">
        <MatchRing percent={job.matchPercent} />
        <span className="text-[10px] text-success font-medium">Match</span>
      </div>
    </Link>
  );
}
