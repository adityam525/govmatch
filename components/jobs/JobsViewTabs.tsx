import Link from 'next/link';
import { X } from 'lucide-react';
import { PHASE_TABS, PRESET_LABELS, type JobsView, type PhaseTab } from '@/lib/jobs-view';

type Params = { [key: string]: string | undefined };

// Keeps every other filter (search, category, state...) when switching view.
function hrefWith(params: Params, overrides: Record<string, string>) {
  const next = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value && key !== 'phase' && key !== 'updates') next.set(key, value);
  }
  for (const [key, value] of Object.entries(overrides)) next.set(key, value);
  const qs = next.toString();
  return qs ? `/jobs?${qs}` : '/jobs';
}

export default function JobsViewTabs({
  view,
  counts,
  params,
}: {
  view: JobsView;
  counts: Record<PhaseTab, number>;
  params: Params;
}) {
  if (view.kind === 'updates') {
    return (
      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-neutral-600">
        <span>Showing</span>
        <Link
          href={hrefWith(params, {})}
          className="flex items-center gap-1.5 rounded-full border border-primary-200 bg-primary-50 px-3 py-1.5 font-medium text-primary-700 hover:bg-primary-100"
        >
          {PRESET_LABELS[view.preset]}
          <X size={12} />
        </Link>
      </div>
    );
  }

  return (
    <div className="mb-4 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {PHASE_TABS.map((tab) => {
        const active = view.tab === tab.id;
        return (
          <Link
            key={tab.id}
            href={hrefWith(params, tab.id === 'open' ? {} : { phase: tab.id })}
            aria-current={active ? 'page' : undefined}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              active
                ? 'border-primary-600 bg-primary-600 text-white'
                : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            {tab.label} <span className={active ? 'opacity-80' : 'text-neutral-400'}>({counts[tab.id]})</span>
          </Link>
        );
      })}
    </div>
  );
}
