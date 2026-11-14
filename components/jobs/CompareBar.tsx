'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { COMPARE_KEY, readCompare } from './CompareToggle';

export default function CompareBar() {
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => {
    const sync = () => setIds(readCompare());
    sync(); window.addEventListener('compare-change', sync); window.addEventListener('storage', sync);
    return () => { window.removeEventListener('compare-change', sync); window.removeEventListener('storage', sync); };
  }, []);
  if (ids.length === 0) return null;
  const clear = () => { try { localStorage.removeItem(COMPARE_KEY); } catch { /* ignore */ } window.dispatchEvent(new Event('compare-change')); };
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <p className="text-sm text-neutral-700">{ids.length} selected{ids.length < 2 ? ', pick one more to compare' : ''}</p>
        <div className="flex items-center gap-2">
          <button type="button" onClick={clear} className="rounded-md px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100">Clear</button>
          {ids.length >= 2 && <Link href={'/compare?posts=' + encodeURIComponent(ids.join(','))} className="rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700">Compare ({ids.length})</Link>}
        </div>
      </div>
    </div>
  );
}
