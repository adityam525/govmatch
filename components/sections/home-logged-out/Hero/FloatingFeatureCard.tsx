import { ReactNode } from "react";
import clsx from "clsx";

interface FloatingFeatureCardProps {
  icon: ReactNode;
  iconBg: string;
  title: string;
  description: string;
  className?: string; // used for absolute positioning around the illustration
}

export default function FloatingFeatureCard({
  icon,
  iconBg,
  title,
  description,
  className,
}: FloatingFeatureCardProps) {
  return (
    <div
      className={clsx(
        "flex items-start gap-3 bg-white border border-neutral-200 rounded-lg shadow-lg p-3 w-56",
        className,
      )}
    >
      <div
        className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0"
        style={{ backgroundColor: `${iconBg}1A`, color: iconBg }}
      >
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-neutral-900 leading-tight">
          {title}
        </p>
        <p className="text-xs text-neutral-600 mt-0.5 leading-tight">
          {description}
        </p>
      </div>
    </div>
  );
}
