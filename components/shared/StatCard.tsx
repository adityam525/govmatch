import { ReactNode } from "react";

interface StatCardProps {
  icon: ReactNode;
  iconBg: string;
  value: string;
  label: string;
}

export default function StatCard({
  icon,
  iconBg,
  value,
  label,
}: StatCardProps) {
  return (
    <div className="flex items-center gap-3 py-3">
      <div
        className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0"
        style={{ backgroundColor: `${iconBg}1A`, color: iconBg }}
      >
        {icon}
      </div>
      <div>
        <p className="text-lg font-bold text-neutral-900 leading-none">
          {value}
        </p>
        <p className="text-xs text-neutral-600 mt-1">{label}</p>
      </div>
    </div>
  );
}
