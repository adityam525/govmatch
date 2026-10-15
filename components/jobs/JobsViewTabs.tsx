import Link from 'next/link';
import { X } from 'lucide-react';
import { PHASE_TABS, PRESET_LABELS, type JobsView, type PhaseFilter } from '@/lib/jobs-view';

type Params = { [key: string]: string | undefined };

// Builds a /jobs URL that keeps every other filter (search, state, ...).
function buildHref(params: Params, set: Record<string, string>, drop: string[] = []) {
  const next = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value && !drop.includes(key) && !(key in set)) next.set(key, value);
  }
  for (const [key, value] of Object.entries(set)) next.set(key, value);
  const qs = next.toString();
  return qs ? `/jobs?${qs}` : '/jobs';
}

export default function JobsViewTabs({
  view,
  counts,
  params,
}: {
  view: JobsView;
  counts: Record<PhaseFilter, number>;
  params: Params;
}) {
  // With a preset active the default is "All"; without one it is "Applications Open".
  const defaultTab: PhaseFilter = view.preset ? 'all' : 'open';

  return (
    <div className="mb-3 flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {view.preset && (
        <>
          <Link
            href={buildHref(params, {}, ['updates'])}
            title="Remove this filter"
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-primary-200 bg-primary-50 px-3 py-1.5 text-sm font-medium text-primary-700 hover:bg-primary-100"
          >
            {PRESET_LABELS[view.preset]}
            <X size={13} />
          </Link>
          <span className="h-5 w-px shrink-0 bg-neutral-200" />
        </>
      )}

      {PHASE_TABS.map((tab) => {
        const active = view.tab === tab.id;
        const urgent = tab.id === 'today' && counts.today > 0 && !active;
        const href =
          tab.id === defaultTab ? buildHref(params, {}, ['phase']) : buildHref(params, { phase: tab.id });
        const style = active
          ? 'border-primary-600 bg-primary-600 text-white'
          : urgent
            ? 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
            : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50';
        return (
          <Link
            key={tab.id}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${style}`}
          >
            {tab.label}{' '}
            <span className={active ? 'opacity-80' : urgent ? 'text-red-400' : 'text-neutral-400'}>
              ({counts[tab.id]})
            </span>
          </Link>
        );
      })}
    </div>
  );
}
