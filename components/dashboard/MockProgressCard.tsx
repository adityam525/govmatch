import Link from 'next/link';
import { loadMockHistory } from '@/lib/mock-history';
import { summarize } from '@/lib/mock-analytics';

export default async function MockProgressCard({ userId }: { userId: string }) {
  let s = null;
  let running = 0;
  try {
    const h = await loadMockHistory(userId);
    s = summarize(h.history);
    running = h.running.length;
  } catch { return null; }

  return (
    <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
        <h2 className="text-sm font-bold text-neutral-900">Mock test progress</h2>
        <Link href="/mock-tests" className="text-xs font-medium text-primary-600 hover:underline">View all</Link>
      </div>
      {!s ? (
        <p className="px-4 py-6 text-center text-xs text-neutral-500">
          {running > 0 ? 'You have a test in progress.' : 'No tests taken yet.'}{' '}
          <Link href="/study-zone/mock-tests" className="font-semibold text-primary-600 underline">Browse mock tests</Link>
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-3 p-4 text-center">
          <div><p className="text-xl font-bold text-neutral-900">{s.count}</p><p className="text-[11px] text-neutral-500">Taken</p></div>
          <div><p className="text-xl font-bold text-neutral-900">{s.averagePercent}%</p><p className="text-[11px] text-neutral-500">Average</p></div>
          <div><p className="text-xl font-bold text-neutral-900">{s.latestPercent}%</p><p className="text-[11px] text-neutral-500">Latest{s.change !== null ? ` (${s.change > 0 ? '+' : ''}${s.change})` : ''}</p></div>
        </div>
      )}
    </section>
  );
}
