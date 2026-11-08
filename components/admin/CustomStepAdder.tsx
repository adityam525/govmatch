'use client';

import { useState } from 'react';

// Adds a selection-process step that is not in the standard list.
export default function CustomStepAdder({ existing, onAdd }: { existing: string[]; onAdd: (step: string) => void }) {
  const [value, setValue] = useState('');
  const add = () => {
    const step = value.trim().slice(0, 60);
    if (!step || existing.some((s) => s.toLowerCase() === step.toLowerCase())) { setValue(''); return; }
    onAdd(step);
    setValue('');
  };
  return (
    <div className="flex max-w-md gap-2">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
        placeholder="Add another step, e.g. Stenography Test"
        maxLength={60}
        className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-primary-500"
      />
      <button type="button" onClick={add} className="shrink-0 rounded-md border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50">Add</button>
    </div>
  );
}
