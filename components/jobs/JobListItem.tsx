import Link from "next/link";
import { Building2, ChevronRight, Users } from "lucide-react";

import Button from "@/components/ui/Button";
import JobMetaChip from "@/components/jobs/JobMetaChip";
import OrgLogo from "@/components/shared/OrgLogo";
import EligibilityHint from "@/components/jobs/EligibilityHint";
import type { Job } from "@/features/jobs/types";

const categoryLabels: Record<Job["category"], string> = {
  central: "Central Govt",
  state: "State Govt",
  banking: "Banking",
  defence: "Defence",
  psu: "PSU",
  teaching: "Teaching",
};

type Tier = "strong" | "good" | "partial" | "none" | "neutral";

function tierOf(matchPercentage: number | undefined, eligible: boolean | undefined): Tier {
  if (eligible === false) return "none";
  if (matchPercentage === undefined) return "neutral";
  if (matchPercentage >= 80) return "strong";
  if (matchPercentage >= 60) return "good";
  return "partial";
}

// The accent bar and tint show how well the job fits at a glance. The badge text says the
// same thing in words, so colour is never the only signal.
const TIERS: Record<Tier, { card: string; accent: string; badge: string; title: string }> = {
  strong: { card: "bg-green-50/50", accent: "bg-green-500", badge: "bg-green-100 text-green-800", title: "Strong match: this job fits your profile well" },
  good: { card: "bg-sky-50/50", accent: "bg-sky-500", badge: "bg-sky-100 text-sky-800", title: "Good match: most of your profile fits" },
  partial: { card: "bg-amber-50/50", accent: "bg-amber-400", badge: "bg-amber-100 text-amber-800", title: "Partial match: some parts of your profile do not fit" },
  none: { card: "bg-red-50/40", accent: "bg-red-400", badge: "", title: "" },
  neutral: { card: "bg-white", accent: "", badge: "", title: "" },
};

interface JobListItemProps {
  job: Job;
  /** Set for logged-in users with a complete profile when the job has posts to score. */
  matchPercentage?: number;
  /** false when no post of this job fits the user's profile. */
  eligible?: boolean;
  /** Why the job does not fit, for the tooltip. */
  verdict?: { label: string; reasons: string[] };
}

export default function JobListItem({ job, matchPercentage, eligible, verdict }: JobListItemProps) {
  const tier = TIERS[tierOf(matchPercentage, eligible)];

  return (
    <article
      className={`group relative overflow-hidden rounded-xl border border-neutral-200 px-4 py-4 transition-all duration-200 hover:border-primary-200 hover:shadow-sm sm:px-5 ${tier.card}`}
    >
      {tier.accent && <span aria-hidden className={`absolute inset-y-0 left-0 w-1 ${tier.accent}`} />}

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
                {eligible === false ? (
                  <EligibilityHint
                    label={verdict?.label ?? "Not eligible"}
                    reasons={verdict?.reasons ?? ["This job does not fit your profile."]}
                  />
                ) : matchPercentage !== undefined ? (
                  <span title={tier.title} className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${tier.badge}`}>
                    {matchPercentage}% match
                  </span>
                ) : null}

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
