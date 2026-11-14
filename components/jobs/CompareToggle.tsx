'use client';

import { useEffect, useState } from 'react';

export const COMPARE_KEY = 'govmatch-compare';
export const COMPARE_MAX = 3;
export const readCompare = (): string[] => {
  try { const v = JSON.parse(localStorage.getItem(COMPARE_KEY) ?? '[]'); return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : []; } catch { return []; }
};
const write = (ids: string[]) => { try { localStorage.setItem(COMPARE_KEY, JSON.stringify(ids)); } catch { /* storage unavailable */ } window.dispatchEvent(new Event('compare-change')); };

// A small checkbox on a job row. id is "noticeId:postId".
export default function CompareToggle({ id, label }: { id: string; label: string }) {
  const [on, setOn] = useState(false);
  const [full, setFull] = useState(false);
  useEffect(() => {
    const sync = () => { const ids = readCompare(); setOn(ids.includes(id)); setFull(ids.length >= COMPARE_MAX && !ids.includes(id)); };
    sync(); window.addEventListener('compare-change', sync); window.addEventListener('storage', sync);
    return () => { window.removeEventListener('compare-change', sync); window.removeEventListener('storage', sync); };
  }, [id]);
  const toggle = () => { const ids = readCompare(); write(ids.includes(id) ? ids.filter((x) => x !== id) : ids.length >= COMPARE_MAX ? ids : [...ids, id]); };
  return (
    <label className={'relative z-10 inline-flex cursor-pointer items-center gap-1.5 text-2xs font-medium ' + (full ? 'cursor-not-allowed text-neutral-400' : 'text-neutral-600')} title={full ? 'You can compare up to ' + COMPARE_MAX + ' posts' : undefined}>
      <input type="checkbox" checked={on} disabled={full} onChange={toggle} aria-label={'Compare ' + label} className="accent-primary-600" />
      Compare
    </label>
  );
}
