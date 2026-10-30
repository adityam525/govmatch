'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';

// Same look as the jobs search. Submitting keeps every other filter in the address.
export default function MockSearch() {
  const router = useRouter();
  const params = useSearchParams();
  const current = params.get('search') ?? '';
  const [text, setText] = useState(current);

  useEffect(() => setText(current), [current]);

  const go = (value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value.trim()) next.set('search', value.trim());
    else next.delete('search');
    const qs = next.toString();
    router.push(qs ? `/study-zone/mock-tests?${qs}` : '/study-zone/mock-tests');
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); go(text); }} className="relative mt-6">
      <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
      <input
        type="text"
        inputMode="search"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Search mock tests, exams, organizations"
        className="h-11 w-full rounded-xl border border-neutral-200 bg-white pl-10 pr-10 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
      />
      {text && (
        <button type="button" aria-label="Clear search" onClick={() => { setText(''); go(''); }} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-neutral-400 hover:text-neutral-600">
          <X size={14} />
        </button>
      )}
    </form>
  );
}
