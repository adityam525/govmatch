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
  matchPercentage?: number;
}

export default function JobListItem({ job, matchPercentage }: JobListItemProps) {
  return (
    <article className="group rounded-xl border border-neutral-200 bg-white px-5 py-4 transition-all duration-200 hover:border-primary-200 hover:shadow-sm">
      <div className="flex items-start gap-4">
        <OrgLogo name={job.org} shortName={job.orgShortName} logoUrl={job.orgLogoUrl} size={56} />

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
