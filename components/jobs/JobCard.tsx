import Link from "next/link";
import Button from "@/components/ui/Button";
import OrgLogo from "@/components/shared/OrgLogo";

export interface JobCardData {
  id: string;
  title: string;
  /** Set when the card is one post of a notice; the notice title then shows underneath. */
  postTitle?: string | null;
  org: string;
  orgShortName?: string | null;
  orgLogoUrl?: string | null;
  /** No longer used (logos replaced the generic icons); kept so existing callers still compile. */
  orgIconName?: string;
  slug: string;
  vacancies: number;
  lastDate: string;
  daysLeft: number | null;
  payScale: string | null;
  qualificationName: string | null;
  badge: "NEW" | "HOT" | "POSTPONED" | null;
}

export default function JobCard({ job }: { job: JobCardData }) {
  const daysLeftLabel =
    job.daysLeft === null ? null : job.daysLeft < 0 ? "Closed" : job.daysLeft === 0 ? "Closing today" : `${job.daysLeft} days left`;
  const daysLeftColor = job.daysLeft === null ? "text-neutral-400" : job.daysLeft <= 3 ? "text-danger" : "text-success";
  const heading = job.postTitle ?? job.title;

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-4 flex flex-col h-full hover:shadow-md hover:border-neutral-300 transition-all">
      <div className="flex items-start justify-between mb-3">
        <OrgLogo name={job.org} shortName={job.orgShortName} logoUrl={job.orgLogoUrl} size={44} />
        {job.badge && (
          <span className={`text-3xs font-bold px-2 py-0.5 rounded-full ${job.badge === "NEW" ? "bg-green-50 text-success" : job.badge === "POSTPONED" ? "bg-amber-100 text-amber-800" : "bg-orange-50 text-accent-orange"}`}>
            {job.badge}
          </span>
        )}
      </div>

      <p className="text-sm font-semibold text-neutral-900 leading-snug line-clamp-2" title={job.postTitle ? `${job.postTitle} (${job.title})` : job.title}>{heading}</p>
      {job.postTitle && <p className="text-xs text-neutral-500 mt-0.5 line-clamp-1">{job.title}</p>}
      <p className="text-xs text-neutral-400 mt-1">{job.org}</p>

      {job.payScale && <p className="text-xs font-medium text-neutral-600 mt-2 line-clamp-2">{job.payScale}</p>}
      {job.qualificationName && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          <span className="text-3xs bg-neutral-100 text-neutral-600 px-2 py-1 rounded-full">{job.qualificationName}</span>
        </div>
      )}

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-100">
        <div>
          <p className="text-sm font-bold text-neutral-900">{job.vacancies.toLocaleString("en-IN")}</p>
          <p className="text-3xs text-neutral-400">Vacancies</p>
        </div>
        {daysLeftLabel && <p className={`text-2xs font-medium ${daysLeftColor}`}>{daysLeftLabel}</p>}
      </div>

      <Link href={`/jobs/${job.slug}`} className="mt-3">
        <Button variant="secondary" size="sm" fullWidth>View Details</Button>
      </Link>
    </div>
  );
}
