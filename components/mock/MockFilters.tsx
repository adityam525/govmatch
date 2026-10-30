'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import FilterDropdown, { type FilterOption } from '@/components/ui/FilterDropdown';

interface Props {
  jobs: FilterOption[];
  organizations: FilterOption[];
  states: FilterOption[];
  levels: FilterOption[];
  difficulties: FilterOption[];
}

export default function MockFilters({ jobs, organizations, states, levels, difficulties }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const current = params.get('search') ?? '';
  const [text, setText] = useState(current);
  useEffect(() => setText(current), [current]);

  const push = (next: URLSearchParams) => {
    const qs = next.toString();
    router.push(qs ? `/study-zone/mock-tests?${qs}` : '/study-zone/mock-tests');
  };
  const set = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value.trim()) next.set(key, value.trim());
    else next.delete(key);
    push(next);
  };

  const field = (key: string, label: string, options: FilterOption[]) => (
    <FilterDropdown
      label={label}
      options={options}
      selected={params.get(key) ? [params.get(key) as string] : []}
      onChange={(ids) => set(key, ids[0] ?? '')}
      multi={false}
      allowClear
      widthClass="w-full lg:w-40"
    />
  );

  const active = ['job', 'organization', 'state', 'level', 'difficulty', 'search'].some((k) => params.get(k));

  return (
    <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm">
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:flex lg:flex-nowrap lg:items-center">
        <form onSubmit={(e) => { e.preventDefault(); set('search', text); }} className="relative sm:col-span-2 lg:min-w-0 lg:flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            inputMode="search"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Search mock tests"
            className="h-10 w-full rounded-lg border border-neutral-200 bg-white pl-9 pr-8 text-sm outline-none placeholder:text-neutral-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
          />
          {text && (
            <button type="button" aria-label="Clear search" onClick={() => { setText(''); set('search', ''); }} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-neutral-400 hover:text-neutral-600">
              <X size={13} />
            </button>
          )}
        </form>
        {field('job', 'Exam', jobs)}
        {field('organization', 'Organization', organizations)}
        {field('state', 'State', states)}
        {field('level', 'Stage', levels)}
        {field('difficulty', 'Difficulty', difficulties)}
        {active && (
          <button type="button" onClick={() => router.push('/study-zone/mock-tests')} className="shrink-0 text-xs text-primary-600 hover:underline">
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}
