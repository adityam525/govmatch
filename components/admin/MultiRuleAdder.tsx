'use client';

import { useState } from 'react';
import Select from '@/components/ui/Select';
import { RULE_CATEGORIES, RULE_STATUSES } from '@/lib/special-categories';

interface Rule { category: string; status: string; years: string; maxAge: string; note: string }

// Adds one relaxation rule per chosen category, so "OBC and SC: +5 years" is one entry.
export default function MultiRuleAdder({ onAdd }: { onAdd: (rules: Rule[]) => void }) {
  const [cats, setCats] = useState<string[]>([]);
  const [status, setStatus] = useState('NONE');
  const [years, setYears] = useState('');
  const [maxAge, setMaxAge] = useState('');
  const options = RULE_CATEGORIES.filter((c) => c.code !== 'ANY');
  const add = () => {
    if (cats.length === 0 || (!years && !maxAge)) return;
    onAdd(cats.map((category) => ({ category, status, years: maxAge ? '' : years, maxAge, note: '' })));
    setCats([]); setYears(''); setMaxAge('');
  };
  const input = 'w-full rounded-md border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-primary-500';
  return (
    <div className="mb-3 rounded-lg border border-dashed border-neutral-300 p-3">
      <p className="mb-2 text-xs font-medium text-neutral-600">Add one rule for several categories</p>
      <div className="mb-2 flex flex-wrap gap-1.5">
        {options.map((c) => {
          const on = cats.includes(c.code);
          return (
            <button key={c.code} type="button" aria-pressed={on} onClick={() => setCats(on ? cats.filter((x) => x !== c.code) : [...cats, c.code])}
              className={'rounded-full border px-2.5 py-1 text-xs ' + (on ? 'border-primary-600 bg-primary-600 text-white' : 'border-neutral-200 bg-white text-neutral-600')}>
              {c.label}
            </button>
          );
        })}
      </div>
      <div className="grid gap-2 sm:grid-cols-[1fr_6rem_6rem_auto]">
        <Select value={status} onChange={setStatus} options={RULE_STATUSES.map((s) => ({ value: s.code, label: s.label }))} />
        <input type="number" step="0.1" min={0} max={40} placeholder="+ years" value={years} onChange={(e) => setYears(e.target.value)} className={input} aria-label="Extra years" />
        <input type="number" step="0.1" min={14} max={80} placeholder="or max age" value={maxAge} onChange={(e) => setMaxAge(e.target.value)} className={input} aria-label="Maximum age" />
        <button type="button" onClick={add} disabled={cats.length === 0 || (!years && !maxAge)} className="rounded-md bg-primary-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-40">Add</button>
      </div>
    </div>
  );
}
