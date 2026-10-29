import Link from "next/link";
import { Building2, ChevronRight } from "lucide-react";

import OrgLogo from "@/components/shared/OrgLogo";
import EligibilityHint from "@/components/jobs/EligibilityHint";
import FitHint from "@/components/jobs/FitHint";
import type { JobFit } from "@/lib/job-fit";
import type { Job } from "@/features/jobs/types";

const categoryLabels: Record<Job["category"], string> = {
  central: "Central Govt", state: "State Govt", banking: "Banking",
  defence: "Defence", psu: "PSU", teaching: "Teaching",
};

type Tier = "strong" | "good" | "partial" | "unknown" | "none" | "neutral";

const TIERS: Record<Tier, { card: string; accent: string; badge: string; title: string }> = {
  strong: { card: "bg-green-50/50", accent: "bg-green-500", badge: "bg-green-100 text-green-800", title: "Strong match: this job fits your profile well" },
  good: { card: "bg-sky-50/50", accent: "bg-sky-500", badge: "bg-sky-100 text-sky-800", title: "Good match: most of your profile fits" },
  partial: { card: "bg-amber-50/50", accent: "bg-amber-400", badge: "bg-amber-100 text-amber-800", title: "Partial match: some parts of your profile do not fit" },
  unknown: { card: "bg-white", accent: "bg-neutral-300", badge: "", title: "" },
  none: { card: "bg-red-50/40", accent: "bg-red-400", badge: "", title: "" },
  neutral: { card: "bg-white", accent: "", badge: "", title: "" },
};

function tierFor(fit: JobFit | undefined, matchPercentage?: number, eligible?: boolean): Tier {
  if (fit) {
    const { verdict, score } = fit.evaluation;
    if (verdict === "not-eligible") return "none";
    if (verdict === "unknown") return "unknown";
    return score >= 80 ? "strong" : score >= 60 ? "good" : "partial";
  }
  if (eligible === false) return "none";
  if (matchPercentage === undefined) return "neutral";
  return matchPercentage >= 80 ? "strong" : matchPercentage >= 60 ? "good" : "partial";
}

interface JobListItemProps {
  job: Job;
  fit?: JobFit;
  matchPercentage?: number;
  eligible?: boolean;
  verdict?: { label: string; reasons: string[] };
}

function Cell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-medium uppercase tracking-wide text-neutral-400 md:hidden">{label}</p>
      <div className="mt-0.5 md:mt-0">{children}</div>
    </div>
  );
}

export default function JobListItem({ job, fit, matchPercentage, eligible, verdict }: JobListItemProps) {
  const tierName = tierFor(fit, matchPercentage, eligible);
  const tier = TIERS[tierName];

  let hint: React.ReactNode = <span className="text-sm text-neutral-300">-</span>;
  if (fit) {
    const { verdict: v, score, label, checks } = fit.evaluation;
    if (v === "not-eligible") hint = <FitHint tone="danger" pill={label} title={`Why: ${label}`} checks={checks} />;
    else if (v === "unknown") hint = <FitHint tone="warning" pill={label} title="We need a little more from your profile" checks={checks} />;
    else hint = (
      <FitHint
        tone={tierName === "strong" ? "success" : tierName === "good" ? "info" : "warning"}
        pill={label}
        title={score === 100 ? "A full match" : `Why ${score}%`}
        checks={checks}
      />
    );
  } else if (eligible === false) {
    hint = <EligibilityHint label={verdict?.label ?? "Not eligible"} reasons={verdict?.reasons ?? ["This job does not fit your profile."]} />;
  } else if (matchPercentage !== undefined) {
    hint = <span title={tier.title} className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${tier.badge}`}>{matchPercentage}% match</span>;
  }

  return (
    <article className={`group relative overflow-hidden rounded-xl border border-neutral-200 px-4 py-4 transition-all duration-200 hover:border-primary-300 hover:shadow-sm sm:px-5 ${tier.card}`}>
      {tier.accent && <span aria-hidden className={`absolute inset-y-0 left-0 w-1 ${tier.accent}`} />}

      <div className="grid items-center gap-3 md:grid-cols-[minmax(0,1fr)_8.5rem_6rem_6.5rem_1rem] md:gap-4">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <OrgLogo name={job.org} shortName={job.orgShortName} logoUrl={job.orgLogoUrl} size={48} />
          <div className="min-w-0">
            {/* This link covers the whole row, so any click opens the job. */}
            <Link
              href={`/jobs/${job.slug}`}
              title={job.title}
              className="line-clamp-2 text-[15px] font-semibold leading-6 text-neutral-900 after:absolute after:inset-0 after:content-[''] group-hover:text-primary-700"
            >
              {job.title}
            </Link>
            <p className="mt-0.5 flex min-w-0 items-center gap-2 text-sm text-neutral-600">
              <span className="truncate">{job.org}</span>
              <span className="hidden shrink-0 items-center gap-1 text-xs text-neutral-400 sm:inline-flex">
                <Building2 size={12} /> {categoryLabels[job.category]}
              </span>
            </p>
            {job.phaseLabel && (
              <span className="mt-1 inline-block rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-medium text-amber-700">{job.phaseLabel}</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 border-t border-neutral-100 pt-3 md:contents md:border-0 md:pt-0">
          <Cell label="Match"><span className="relative z-10 inline-block">{hint}</span></Cell>
          <Cell label="Vacancies">
            <p className="text-sm font-semibold text-neutral-900">{job.vacancies.toLocaleString("en-IN")}</p>
          </Cell>
          <Cell label="Last date">
            <p className="text-sm font-semibold text-danger">{job.lastDate}</p>
          </Cell>
        </div>

        <ChevronRight size={16} aria-hidden className="hidden text-neutral-300 group-hover:text-primary-600 md:block" />
      </div>
    </article>
  );
}
