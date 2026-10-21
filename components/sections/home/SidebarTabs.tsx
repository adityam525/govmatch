'use client';

import { useId, useState } from 'react';

export interface SidebarTab {
  id: string;
  label: string;
  count?: number;
  tone?: 'urgent';
  content: React.ReactNode;
  footer: React.ReactNode;
}

// The list area has a fixed height and the footer is always present, so switching tabs
// never changes the card's size (that was the jump when moving between the two lists).
export default function SidebarTabs({ tabs }: { tabs: SidebarTab[] }) {
  const baseId = useId();
  const [activeId, setActiveId] = useState(tabs[0]?.id ?? '');
  if (tabs.length === 0) return null;
  const active = tabs.find((tab) => tab.id === activeId) ?? tabs[0];

  return (
    <div>
      {tabs.length > 1 && (
        <div role="tablist" aria-label="Job lists" className="flex gap-1 border-b border-neutral-100 px-3">
          {tabs.map((tab) => {
            const selected = tab.id === active.id;
            return (
              <button
                key={tab.id}
                id={`${baseId}-${tab.id}-tab`}
                role="tab"
                type="button"
                aria-selected={selected}
                aria-controls={`${baseId}-panel`}
                onClick={() => setActiveId(tab.id)}
                className={`-mb-px flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-xs font-semibold transition-colors ${
                  selected
                    ? 'border-primary-600 text-primary-700'
                    : 'border-transparent text-neutral-500 hover:text-neutral-800'
                }`}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] leading-none ${
                      selected
                        ? 'bg-primary-50 text-primary-700'
                        : tab.tone === 'urgent'
                          ? 'bg-red-50 text-red-600'
                          : 'bg-neutral-100 text-neutral-500'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      <div
        key={active.id}
        id={`${baseId}-panel`}
        role="tabpanel"
        aria-labelledby={tabs.length > 1 ? `${baseId}-${active.id}-tab` : undefined}
        className="h-[19.5rem] overflow-y-auto overscroll-contain"
      >
        <div className="flex min-h-full flex-col">{active.content}</div>
      </div>

      <div className="flex h-11 items-center justify-center border-t border-neutral-100">{active.footer}</div>
    </div>
  );
}
