'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks';
import { currentMonth, deadlinesSoon, groupByDay, istDayKey, istTimeLabel, monthGrid, shiftMonth, type CalendarEvent } from '@/lib/exam-calendar';

const KINDS: Record<string, { label: string; dot: string }> = {
  APPLICATION_OPEN: { label: 'Applications open', dot: 'bg-green-500' },
  APPLICATION_CLOSE: { label: 'Applications close', dot: 'bg-red-500' },
  ADMIT_CARD: { label: 'Admit card', dot: 'bg-sky-500' },
  EXAM: { label: 'Exam', dot: 'bg-purple-600' },
  RESULT: { label: 'Result', dot: 'bg-amber-500' },
  NOTIFICATION: { label: 'Notification', dot: 'bg-neutral-400' },
  OTHER: { label: 'Other', dot: 'bg-neutral-400' },
};
const kind = (k: string) => KINDS[k] ?? KINDS.OTHER;
const monthTitle = (m: string) => new Date(m + '-01T00:00:00Z').toLocaleDateString('en-IN', { month: 'long', year: 'numeric', timeZone: 'UTC' });
const dayTitle = (d: string) => new Date(d + 'T00:00:00Z').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });

export default function ExamCalendar({ title = 'Exam calendar' }: { title?: string }) {
  const { user, isLoggedIn } = useAuth();
  const [scope, setScope] = useState<'all' | 'mine'>('all');
  const [month, setMonth] = useState(currentMonth());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(istDayKey(new Date()));

  const base = scope === 'mine' && user?.id ? '/api/users/' + user.id + '/calendar' : '/api/calendar';
  const needLogin = scope === 'mine' && !isLoggedIn;

  useEffect(() => {
    if (needLogin) { setEvents([]); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError('');
    fetch(base + '?month=' + month)
      .then(async (r) => { const d = await r.json(); if (!r.ok) throw new Error(d.message); return d; })
      .then((d) => { if (!cancelled) setEvents(d.events ?? []); })
      .catch((e) => { if (!cancelled) setError(e.message || 'Could not load the calendar.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [base, month, needLogin]);

  const byDay = useMemo(() => groupByDay(events), [events]);
  const grid = useMemo(() => monthGrid(month), [month]);
  const soon = useMemo(() => deadlinesSoon(events, Date.now()), [events]);
  const today = istDayKey(new Date());
  const dayEvents = byDay.get(selected) ?? [];

  const tab = (on: boolean) => 'rounded-full px-3.5 py-1.5 text-sm font-medium ' + (on ? 'bg-primary-600 text-white' : 'text-neutral-600 hover:bg-neutral-100');

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5" aria-label={title}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-bold text-neutral-900">{title}</h2>
        <div className="flex items-center gap-1 rounded-full border border-neutral-200 p-1" role="tablist" aria-label="Which exams">
          <button type="button" role="tab" aria-selected={scope === 'all'} className={tab(scope === 'all')} onClick={() => setScope('all')}>All exams</button>
          <button type="button" role="tab" aria-selected={scope === 'mine'} className={tab(scope === 'mine')} onClick={() => setScope('mine')}>My exams</button>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button type="button" aria-label="Previous month" onClick={() => setMonth(shiftMonth(month, -1))} className="rounded-md p-2 text-neutral-600 hover:bg-neutral-100"><ChevronLeft size={18} /></button>
        <div className="flex items-center gap-3">
          <p className="text-sm font-semibold text-neutral-900">{monthTitle(month)}</p>
          {month !== currentMonth() && <button type="button" onClick={() => { setMonth(currentMonth()); setSelected(today); }} className="text-xs text-primary-600 hover:underline">Today</button>}
        </div>
        <button type="button" aria-label="Next month" onClick={() => setMonth(shiftMonth(month, 1))} className="rounded-md p-2 text-neutral-600 hover:bg-neutral-100"><ChevronRight size={18} /></button>
      </div>

      {needLogin ? (
        <p className="mt-6 rounded-lg bg-neutral-50 p-6 text-center text-sm text-neutral-600">
          <Link href={'/login?callbackUrl=' + encodeURIComponent('/calendar')} className="font-semibold text-primary-600 underline">Log in</Link> to see the dates of the jobs you saved or applied to.
        </p>
      ) : (
        <>
          <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-neutral-500">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => <span key={d}>{d}</span>)}
          </div>
          <div className={'mt-1 grid grid-cols-7 gap-1 ' + (loading ? 'opacity-50' : '')}>
            {grid.flat().map((day, i) => {
              if (!day) return <span key={'b' + i} />;
              const list = byDay.get(day) ?? [];
              const kinds = [...new Set(list.map((e) => e.kind))].slice(0, 4);
              const hasClose = list.some((e) => e.kind === 'APPLICATION_CLOSE');
              return (
                <button key={day} type="button" onClick={() => setSelected(day)} aria-label={dayTitle(day) + (list.length ? ', ' + list.length + ' events' : '')}
                  className={'flex h-12 flex-col items-center justify-center rounded-lg border text-xs sm:h-14 ' +
                    (day === selected ? 'border-primary-600 bg-primary-50 ' : hasClose ? 'border-red-200 bg-red-50/50 ' : 'border-transparent hover:bg-neutral-50 ') +
                    (day === today ? 'font-bold text-primary-700 ring-1 ring-primary-300' : 'text-neutral-800')}>
                  <span>{Number(day.slice(8))}</span>
                  <span className="mt-1 flex h-1.5 gap-0.5">{kinds.map((k) => <i key={k} className={'h-1.5 w-1.5 rounded-full ' + kind(k).dot} />)}</span>
                </button>
              );
            })}
          </div>

          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-neutral-600">
            {['APPLICATION_OPEN', 'APPLICATION_CLOSE', 'ADMIT_CARD', 'EXAM', 'RESULT'].map((k) => <li key={k} className="flex items-center gap-1.5"><i className={'h-2 w-2 rounded-full ' + kind(k).dot} />{kind(k).label}</li>)}
          </ul>

          {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">{error}</p>}

          {soon.length > 0 && (
            <div className="mt-4 rounded-xl border border-red-100 bg-red-50/60 p-3">
              <p className="text-xs font-semibold text-red-800">Applications closing in the next 7 days</p>
              <ul className="mt-1 space-y-1">
                {soon.map((e) => (
                  <li key={e.id} className="flex flex-wrap justify-between gap-2 text-sm">
                    <Link href={'/jobs/' + e.jobSlug} className="font-medium text-neutral-900 hover:text-primary-700">{e.jobTitle}</Link>
                    <span className="text-red-700">{dayTitle(istDayKey(e.at))}{e.timeKnown ? ', ' + istTimeLabel(e.at) : ''}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{dayTitle(selected)}</p>
            {dayEvents.length === 0 ? (
              <p className="mt-2 text-sm text-neutral-500">{loading ? 'Loading...' : events.length === 0 ? (scope === 'mine' ? 'No dates yet. Save a job to see its dates here.' : 'No dates in this month.') : 'Nothing on this day.'}</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {dayEvents.map((e) => (
                  <li key={e.id} className="flex items-start gap-3 rounded-lg border border-neutral-200 p-3">
                    <i className={'mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ' + kind(e.kind).dot} />
                    <div className="min-w-0 flex-1">
                      <Link href={'/jobs/' + e.jobSlug} className="text-sm font-medium text-neutral-900 hover:text-primary-700">{e.jobTitle}</Link>
                      <p className="text-xs text-neutral-600">{e.label}{e.timeKnown ? ' at ' + istTimeLabel(e.at) : ' (by end of day)'}</p>
                    </div>
                    {e.postponed && <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">Postponed</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <a href={base + '?month=' + month + '&format=ics'} className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:underline"><Download size={13} /> Add this month to Google or Apple Calendar (.ics)</a>
        </>
      )}
    </section>
  );
}
