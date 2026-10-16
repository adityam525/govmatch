import Link from 'next/link';
import { PHASE_TABS, type JobsView, type PhaseFilter } from '@/lib/jobs-view';

type Params = { [key: string]: string | undefined };

// Builds a /jobs URL that keeps every other filter (search, state, preset...).
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
    <div className="mb-4 border-b border-neutral-200">
      <div className="-mb-px flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {PHASE_TABS.map((tab) => {
          const active = view.tab === tab.id;
          const urgent = tab.id === 'today' && counts.today > 0;
          const href =
            tab.id === defaultTab ? buildHref(params, {}, ['phase']) : buildHref(params, { phase: tab.id });
          return (
            <Link
              key={tab.id}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={`flex shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
                active
                  ? 'border-primary-600 text-primary-700'
                  : 'border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-800'
              }`}
            >
              {tab.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold leading-none ${
                  active
                    ? 'bg-primary-50 text-primary-700'
                    : urgent
                      ? 'bg-red-50 text-red-600'
                      : 'bg-neutral-100 text-neutral-500'
                }`}
              >
                {counts[tab.id]}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
