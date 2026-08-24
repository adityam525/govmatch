import { LucideIcon } from "lucide-react";
import clsx from "clsx";

interface JobMetaChipProps {
  icon: LucideIcon;
  children: React.ReactNode;
  className?: string;
}

export default function JobMetaChip({
  icon: Icon,
  children,
  className,
}: JobMetaChipProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700",
        className,
      )}
    >
      <Icon size={14} className="shrink-0" />
      <span>{children}</span>
    </span>
  );
}
