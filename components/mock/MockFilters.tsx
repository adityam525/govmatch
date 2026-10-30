'use client';

import { useRouter, useSearchParams } from 'next/navigation';
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

  const set = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    const qs = next.toString();
    router.push(qs ? `/study-zone/mock-tests?${qs}` : '/study-zone/mock-tests');
  };

  const field = (key: string, label: string, options: FilterOption[], width: string) => (
    <FilterDropdown
      label={label}
      options={options}
      selected={params.get(key) ? [params.get(key) as string] : []}
      onChange={(ids) => set(key, ids[0] ?? '')}
      multi={false}
      allowClear
      widthClass={width}
    />
  );

  const active = ['job', 'organization', 'state', 'level', 'difficulty'].some((k) => params.get(k));

  return (
    <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2.5">
        {field('job', 'Exam', jobs, 'w-64')}
        {field('organization', 'Organization', organizations, 'w-56')}
        {field('state', 'State', states, 'w-48')}
        {field('level', 'Exam stage', levels, 'w-48')}
        {field('difficulty', 'Difficulty', difficulties, 'w-44')}
        {active && (
          <button type="button" onClick={() => router.push('/study-zone/mock-tests')} className="text-xs text-primary-600 hover:underline">
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}
