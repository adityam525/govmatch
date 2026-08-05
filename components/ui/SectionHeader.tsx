"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ReactNode } from "react";

interface SectionHeaderProps {
  title: string;
  description?: string;
  subtitle?: string;

  align?: "left" | "center" | "right";

  action?: ReactNode;

  viewAllHref?: string;
  viewAllLabel?: string;

  className?: string;
}

export default function SectionHeader({
  title,
  description,
  subtitle,
  align = "left",
  action,
  viewAllHref,
  viewAllLabel = "View All",
  className = "",
}: SectionHeaderProps) {
  const text = description ?? subtitle;

  const alignment =
    align === "center"
      ? "items-center text-center"
      : align === "right"
        ? "items-end text-right"
        : "items-start text-left";

  return (
    <div
      className={`flex flex-col gap-4 md:flex-row md:justify-between my-6 ${alignment} ${className}`}
    >
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-neutral-900">
          {title}
        </h2>

        {text && <p className="mt-2 max-w-3xl text-neutral-600">{text}</p>}
      </div>

      {action}

      {!action && viewAllHref && (
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
