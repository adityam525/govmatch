import Link from "next/link";
import { Building2, ChevronRight, Users } from "lucide-react";

import Button from "@/components/ui/Button";
import JobMetaChip from "@/components/jobs/JobMetaChip";
import OrgLogo from "@/components/shared/OrgLogo";
import type { Job } from "@/features/jobs/types";

const categoryLabels: Record<Job["category"], string> = {
  central: "Central Govt",
  state: "State Govt",
  banking: "Banking",
  defence: "Defence",
  psu: "PSU",
  teaching: "Teaching",
};

interface JobListItemProps {
  job: Job;
  /** Set for logged-in users when the job has posts to score. */
  matchPercentage?: number;
  /** false when no post of this job fits the user's profile. */
  eligible?: boolean;
}

function MatchBadge({ percentage, eligible }: { percentage: number; eligible?: boolean }) {
  if (eligible === false) {
    return (
      <span
        title="Based on your profile: qualification, age or job type does not fit"
        className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-semibold text-neutral-500"
      >
        Not eligible
      </span>
    );
  }
  const tone =
    percentage >= 80
      ? "bg-green-50 text-green-700"
      : percentage >= 60
        ? "bg-sky-50 text-sky-700"
        : "bg-amber-50 text-amber-700";
  return (
    <span title="How well this job fits your profile" className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${tone}`}>
      {percentage}% match
    </span>
  );
}

export default function JobListItem({ job, matchPercentage, eligible }: JobListItemProps) {
  return (
    <article className="group rounded-xl border border-neutral-200 bg-white px-4 py-4 transition-all duration-200 hover:border-primary-200 hover:shadow-sm sm:px-5">
      <div className="flex items-start gap-3 sm:gap-4">
        <OrgLogo name={job.org} shortName={job.orgShortName} logoUrl={job.orgLogoUrl} size={56} className="hidden sm:flex" />
        <OrgLogo name={job.org} shortName={job.orgShortName} logoUrl={job.orgLogoUrl} size={44} className="sm:hidden" />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-6">
            <div className="min-w-0 flex-1">
              <h3
                title={job.title}
                className="line-clamp-2 text-[15px] font-semibold leading-6 text-neutral-900 group-hover:text-primary-700"
              >
                {job.title}
              </h3>

              <p className="mt-0.5 text-sm text-neutral-600">{job.org}</p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {matchPercentage !== undefined && <MatchBadge percentage={matchPercentage} eligible={eligible} />}

                <JobMetaChip icon={Users}>
                  {job.vacancies.toLocaleString("en-IN")} {job.vacancies === 1 ? "Vacancy" : "Vacancies"}
                </JobMetaChip>

                <JobMetaChip icon={Building2}>{categoryLabels[job.category]}</JobMetaChip>

                {job.phaseLabel && (
                  <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700">
                    {job.phaseLabel}
                  </span>
                )}
              </div>
            </div>

            <div className="hidden shrink-0 text-right md:block">
              <p className="text-[11px] text-neutral-400">Last date</p>
              <p className="text-sm font-semibold text-danger">{job.lastDate}</p>

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

          <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3 md:hidden">
            <div>
              <p className="text-[11px] text-neutral-400">Last date</p>
              <p className="text-sm font-semibold text-danger">{job.lastDate}</p>
            </div>

            <Link href={`/jobs/${job.slug}`}>
              <Button variant="secondary" size="sm" icon={<ChevronRight size={15} />} iconPosition="right">
                View
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
