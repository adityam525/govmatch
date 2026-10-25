'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { CalendarClock, Plus, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { EVENT_KINDS, describeChange, istDay, istTime } from '@/lib/schedule';

interface Change {
  kind: string;
  oldAt: string | null;
  oldTimeKnown: boolean;
  newAt: string | null;
  newTimeKnown: boolean;
  reason: string | null;
  createdAt: string;
}

interface Row {
  key: number;
  id?: string;
  kind: string;
  label: string;
  day: string;
  time: string;
  reason: string;
  /** The day and time as last saved, to tell whether this row was moved. */
  savedDay: string;
  savedTime: string;
  history: Change[];
}

interface ApiEvent {
  id: string;
  kind: string;
  label: string;
  at: string | null;
  timeKnown: boolean;
  history: Change[];
}

const input = 'w-full text-sm border border-neutral-200 rounded-md px-3 py-2 outline-none focus:border-primary-500';
const DEFAULT_LABELS: Record<string, string> = {
  APPLICATION_OPEN: 'Applications open',
  APPLICATION_CLOSE: 'Applications close',
  ADMIT_CARD: 'Admit card',
  EXAM: 'Exam',
  RESULT: 'Result',
  OTHER: '',
};

export default function ScheduleEditor({ jobId }: { jobId: string }) {
  const counter = useRef(1);
  const [rows, setRows] = useState<Row[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);

  const toRows = useCallback((events: ApiEvent[]): Row[] =>
    events.map((e) => {
      const day = e.at ? istDay(e.at) : '';
      const time = e.at && e.timeKnown ? istTime(e.at) : '';
      return {
        key: counter.current++,
        id: e.id,
        kind: e.kind,
        label: e.label,
        day,
        time,
        reason: '',
        savedDay: day,
        savedTime: time,
        history: e.history,
      };
    }), []);

  useEffect(() => {
    fetch(`/api/admin/jobs/${jobId}/schedule`)
      .then((r) => r.json())
      .then((d) => setRows(toRows(Array.isArray(d) ? d : [])))
      .catch(() => setMessage({ kind: 'error', text: 'Could not load the schedule.' }))
      .finally(() => setLoaded(true));
  }, [jobId, toRows]);

  const update = (key: number, patch: Partial<Row>) => {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
    setMessage(null);
  };

  const add = (kind: string) => {
    setRows((prev) => [
      ...prev,
      { key: counter.current++, kind, label: DEFAULT_LABELS[kind] ?? '', day: '', time: '', reason: '', savedDay: '', savedTime: '', history: [] },
    ]);
    setMessage(null);
  };

  const save = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/jobs/${jobId}/schedule`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          events: rows.map(({ id, kind, label, day, time, reason }) => ({ id, kind, label, day, time, reason })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({ kind: 'error', text: data.message ?? 'Could not save the schedule.' });
        return;
      }
      setRows(toRows(Array.isArray(data) ? data : []));
      setMessage({ kind: 'ok', text: 'Schedule saved.' });
    } catch {
      setMessage({ kind: 'error', text: 'Network error. Nothing was saved.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="md:col-span-2 border-t border-neutral-100 pt-5 mt-2">
      <div className="mb-1 flex items-center gap-2">
        <CalendarClock size={16} className="text-primary-600" />
        <p className="text-sm font-semibold text-neutral-900">Schedule and postponements</p>
      </div>
      <p className="mb-3 text-xs text-neutral-500">
        Leave the time empty when the notice gives only a date (it then counts as the end of that day). To postpone,
        change the date or time and add a reason. To say a date is not announced yet, clear the date. All times are IST.
        This section saves on its own button. Once a job has a schedule it also controls the application and exam dates, so the date boxes higher up in this form are not used when you save.
      </p>

      {!loaded ? (
        <p className="text-xs text-neutral-400">Loading...</p>
      ) : (
        <>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {EVENT_KINDS.map((k) => (
              <button key={k.code} type="button" onClick={() => add(k.code)} className="rounded-full border border-dashed border-neutral-300 px-2.5 py-1 text-[11px] text-neutral-600 hover:border-primary-300 hover:text-primary-600">
                + {k.label}
              </button>
            ))}
          </div>

          {rows.length === 0 && <p className="mb-3 text-xs text-neutral-400">No events yet.</p>}

          <div className="space-y-3">
            {rows.map((row) => {
              const moved = !!row.id && (row.day !== row.savedDay || row.time !== row.savedTime);
              return (
                <div key={row.key} className="rounded-lg border border-neutral-200 p-3">
                  <div className="grid gap-2 sm:grid-cols-[9rem_1fr_9.5rem_7rem_auto]">
                    <select value={row.kind} onChange={(e) => update(row.key, { kind: e.target.value })} className={input} aria-label="Event type">
                      {EVENT_KINDS.map((k) => (
                        <option key={k.code} value={k.code}>{k.label}</option>
                      ))}
                    </select>
                    <input type="text" value={row.label} maxLength={120} onChange={(e) => update(row.key, { label: e.target.value })} placeholder="Name, e.g. Prelims exam" className={input} aria-label="Event name" />
                    <input type="date" value={row.day} onChange={(e) => update(row.key, { day: e.target.value, ...(e.target.value ? {} : { time: '' }) })} className={input} aria-label="Date" />
                    <input type="time" value={row.time} disabled={!row.day} onChange={(e) => update(row.key, { time: e.target.value })} className={`${input} disabled:bg-neutral-100`} aria-label="Time (optional)" />
                    <button
                      type="button"
                      onClick={() => setRows((prev) => prev.filter((r) => r.key !== row.key))}
                      aria-label="Remove event"
                      className="justify-self-end rounded-md p-2 text-neutral-400 hover:bg-red-50 hover:text-danger"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {!row.day && <p className="mt-1.5 text-[11px] text-amber-700">No date: this event will show as &quot;Date to be announced&quot;.</p>}

                  {moved && (
                    <input
                      type="text"
                      value={row.reason}
                      maxLength={200}
                      onChange={(e) => update(row.key, { reason: e.target.value })}
                      placeholder="Reason for the change (optional, shown to users), e.g. due to elections"
                      className={`${input} mt-2`}
                    />
                  )}

                  {row.history.length > 1 && (
                    <ul className="mt-2 space-y-0.5 border-t border-neutral-100 pt-2">
                      {row.history.map((h, i) => (
                        <li key={i} className="text-[11px] text-neutral-500">
                          {new Date(h.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', timeZone: 'Asia/Kolkata' })}
                          {': '}
                          {describeChange(h)}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Button type="button" variant="secondary" size="sm" icon={<Plus size={14} />} onClick={() => add('OTHER')}>
              Add event
            </Button>
            <Button type="button" variant="primary" size="sm" onClick={save} disabled={saving}>
              {saving ? 'Saving...' : 'Save schedule'}
            </Button>
            {message && <span className={`text-xs ${message.kind === 'ok' ? 'text-success' : 'text-danger'}`}>{message.text}</span>}
          </div>
        </>
      )}
    </div>
  );
}
