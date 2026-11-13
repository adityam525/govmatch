import { ReactNode } from "react";
import clsx from "clsx";

const TONES = {
  purple: "bg-accent-purple/10 text-accent-purple",
  blue: "bg-primary-600/10 text-primary-600",
  orange: "bg-accent-orange/10 text-orange-700",
  green: "bg-accent-green/10 text-green-700",
} as const;

interface FloatingFeatureCardProps {
  icon: ReactNode;
  tone: keyof typeof TONES;
  title: string;
  description: string;
  className?: string; // used for absolute positioning around the illustration
}

export default function FloatingFeatureCard({
  icon,
  tone,
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
      <div className={"flex items-center justify-center w-9 h-9 rounded-lg shrink-0 " + TONES[tone]}>
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
