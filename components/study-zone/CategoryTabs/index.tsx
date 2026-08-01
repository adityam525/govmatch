'use client';

import { StudyToolCategory } from '@/features/study-tools/types/study-tool';

export interface CategoryTabsProps {
  value: StudyToolCategory | 'all';
  onChange: (value: StudyToolCategory | 'all') => void;
  className?: string;
}

const tabs: {
  value: StudyToolCategory | 'all';
  label: string;
}[] = [
  {
    value: 'all',
    label: 'All',
  },
  {
    value: 'practice',
    label: 'Practice',
  },
  {
    value: 'tools',
    label: 'Study Tools',
  },
  {
    value: 'resources',
    label: 'Resources',
  },
  {
    value: 'planning',
    label: 'Planning',
  },
  {
    value: 'premium',
    label: 'Premium',
  },
];

export default function CategoryTabs({
  value,
  onChange,
  className = '',
}: CategoryTabsProps) {
  return (
    <div
      className={`overflow-x-auto scrollbar-hide ${className}`}
    >
      <div className="inline-flex min-w-full gap-2 rounded-xl border border-neutral-200 bg-white p-2">

        {tabs.map((tab) => {
          const active = value === tab.value;

          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => onChange(tab.value)}
              className={`
                whitespace-nowrap
                rounded-lg
                px-5
                py-2.5
                text-sm
                font-medium
                transition-all
                duration-200

                ${
                  active
                    ? 'bg-primary-600 text-white shadow'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                }
              `}
            >
              {tab.label}
            </button>
          );
        })}

      </div>
    </div>
  );
}
