'use client';

import clsx from 'clsx';

const tabs = [
  { id: 'all', label: 'All Jobs' },
  { id: 'central', label: 'Central Govt.' },
  { id: 'state', label: 'State Govt.' },
  { id: 'psu', label: 'PSU' },
  { id: 'banking', label: 'Banking' },
  { id: 'defence', label: 'Defence' },
  { id: 'teaching', label: 'Teaching' },
];

interface TabFilterBarProps {
  activeTab: string;
  onChange: (tabId: string) => void;
}

export default function TabFilterBar({ activeTab, onChange }: TabFilterBarProps) {
  return (
    <div className="flex gap-2 pb-4 overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={clsx(
            'px-4 py-2 text-sm font-medium whitespace-nowrap rounded-full border transition-colors shrink-0',
            activeTab === tab.id
              ? 'bg-primary-600 text-white border-primary-600'
              : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
