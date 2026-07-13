import { ReactNode } from "react";
import clsx from "clsx";

interface IconTextRowProps {
  icon: ReactNode;
  iconBg?: string; // hex color for icon background chip
  title: string;
  description?: string;
  className?: string;
}

export default function IconTextRow({
  icon,
  iconBg,
  title,
  description,
  className,
}: IconTextRowProps) {
  return (
    <div className={clsx("flex items-start gap-3", className)}>
      <div
        className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0"
        style={{
          backgroundColor: iconBg ? `${iconBg}1A` : "#f1f5f9",
          color: iconBg,
        }}
      >
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-neutral-900">{title}</p>
        {description && (
          <p className="text-xs text-neutral-600 mt-0.5">{description}</p>
        )}
      </div>
    </div>
  );
}
