'use client';

import { ReactNode } from 'react';
import clsx from 'clsx';

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export default function SectionTitle({
  title,
  subtitle,
  description,
  action,
  className,
}: SectionTitleProps) {
  const text = subtitle ?? description;

  return (
    <div
      className={clsx(
        'flex flex-col gap-4 md:flex-row md:items-end md:justify-between',
        className,
      )}
    >
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-neutral-900">
          {title}
        </h2>

        {text && (
          <p className="mt-2 max-w-3xl text-neutral-600">
            {text}
          </p>
        )}
      </div>

      {action && (
        <div className="shrink-0">
          {action}
        </div>
      )}
    </div>
  );
}
