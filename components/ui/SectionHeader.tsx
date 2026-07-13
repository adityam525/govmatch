import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  viewAllHref?: string;
  viewAllLabel?: string;
}

export default function SectionHeader({
  title,
  viewAllHref,
  viewAllLabel = "View All",
}: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-bold text-neutral-900">{title}</h2>
      {viewAllHref && (
        <Link
          href={viewAllHref}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          {viewAllLabel}
          <ArrowRight size={16} />
        </Link>
      )}
    </div>
  );
}
