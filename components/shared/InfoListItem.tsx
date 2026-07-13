import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface InfoListItemProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  date: string;
  href: string;
}

export default function InfoListItem({
  icon: Icon,
  title,
  subtitle,
  date,
  href,
}: InfoListItemProps) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between py-3 border-b border-neutral-100 last:border-0 hover:bg-neutral-50 -mx-2 px-2 rounded-md transition-colors"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary-50 text-primary-600 shrink-0">
          <Icon size={16} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-neutral-900 truncate">
            {title}
          </p>
          <p className="text-xs text-neutral-400 truncate">{subtitle}</p>
        </div>
      </div>
      <p className="text-xs text-neutral-400 shrink-0 pl-2">{date}</p>
    </Link>
  );
}
