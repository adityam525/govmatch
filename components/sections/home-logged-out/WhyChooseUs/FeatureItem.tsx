import { ReactNode } from "react";

interface FeatureItemProps {
  icon: ReactNode;
  iconBg: string;
  title: string;
  description: string;
}

export default function FeatureItem({
  icon,
  iconBg,
  title,
  description,
}: FeatureItemProps) {
  return (
    <div className="flex items-start gap-3">
      <div
        className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0"
        style={{ backgroundColor: `${iconBg}1A`, color: iconBg }}
      >
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-neutral-900">{title}</p>
        <p className="text-xs text-neutral-600 mt-0.5">{description}</p>
      </div>
    </div>
  );
}
