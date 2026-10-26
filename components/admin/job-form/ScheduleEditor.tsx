'use client';

import { Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { EVENT_KINDS, describeChange, istDay, istTime } from '@/lib/schedule';

export interface Change {
  kind: string;
  oldAt: string | null;
  oldTimeKnown: boolean;
  newAt: string | null;
  newTimeKnown: boolean;
  reason: string | null;
  createdAt: string;
}

export interface ApiEvent {
  id: string;
  kind: string;
  label: string;
  at: string | null;
  timeKnown: boolean;
  history: Change[];
}

export interface ScheduleRow {
  key: number;
  id?: string;
  kind: string;
  label: string;
  day: string;
  time: string;
  reason: string;
  /** Day and time as last saved, to tell whether this row was moved. */
  savedDay: string;
  savedTime: string;
  history: Change[];
}

let counter = 1;

const DEFAULT_LABELS: Record<string, string> = {
  NOTIFICATION: 'Notification published',
  APPLICATION_OPEN: 'Applications open',
  APPLICATION_CLOSE: 'Applications close',
  ADMIT_CARD: 'Admit card',
  EXAM: 'Exam',
  RESULT: 'Result',
  OTHER: '',
};
const STANDARD = ['NOTIFICATION', 'APPLICATION_OPEN', 'APPLICATION_CLOSE', 'EXAM'];
const input = 'w-full text-sm border border-neutral-200 rounded-md px-3 py-2 outline-none focus:border-primary-500';

const blank = (kind: string): ScheduleRow => ({
  key: counter++, kind, label: DEFAULT_LABELS[kind] ?? '', day: '', time: '', reason: '', savedDay: '', savedTime: '', history: [],
});

export const standardRows = (): ScheduleRow[] => STANDARD.map(blank);

export function rowsFromApi(events: ApiEvent[]): ScheduleRow[] {
  return events.map((e) => {
    const day = e.at ? istDay(e.at) : '';
    const time = e.at && e.timeKnown ? istTime(e.at) : '';
    return { key: counter++, id: e.id, kind: e.kind, label: e.label, day, time, reason: '', savedDay: day, savedTime: time, history: e.history };
  });
}

// A new row with no date is just an unused placeholder. A saved row with no date means "date to be announced".
export const keptSchedule = (rows: ScheduleRow[]) => rows.filter((r) => r.id || r.day);

export async function loadSchedule(jobId: string): Promise<ScheduleRow[]> {
  const res = await fetch(`/api/admin/jobs/${jobId}/schedule`);
  const data = await res.json().catch(() => null);
  if (!res.ok || !Array.isArray(data)) throw new Error('Could not load the schedule.');
  return rowsFromApi(data);
}

export async function saveSchedule(jobId: string, rows: ScheduleRow[]): Promise<void> {
  const events = keptSchedule(rows).map(({ id, kind, label, day, time, reason }) => ({ id, kind, label, day, time, reason }));
  const res = await fetch(`/api/admin/jobs/${jobId}/schedule`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ events }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message ?? 'Could not save the schedule.');
}

export default function ScheduleEditor({ rows, onChange }: { rows: ScheduleRow[]; onChange: (rows: ScheduleRow[]) => void }) {
  const update = (key: number, patch: Partial<ScheduleRow>) => onChange(rows.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  const add = (kinds: string[]) => onChange([...rows, ...kinds.map(blank)]);

  return (
    <div>
      <p className="mb-3 text-xs text-neutral-500">
        Leave the time empty when the notice gives only a date (it then counts as the end of that day). To postpone, change
        the date or time and add a reason. To say a date is not announced yet, clear the date of a saved event. All times are IST.
      </p>

      <div className="mb-3 flex flex-wrap gap-1.5">
        {EVENT_KINDS.map((k) => (
          <button key={k.code} type="button" onClick={() => add([k.code])} className="rounded-full border border-dashed border-neutral-300 px-2.5 py-1 text-[11px] text-neutral-600 hover:border-primary-300 hover:text-primary-600">
            + {k.label}
          </button>
        ))}
        {rows.length === 0 && (
          <Button type="button" variant="secondary" size="sm" onClick={() => add(STANDARD)}>
            Add standard dates
          </Button>
        )}
      </div>

      {rows.length === 0 && <p className="text-xs text-neutral-400">No dates yet.</p>}

      <div className="space-y-3">
        {rows.map((row) => {
          const moved = !!row.id && (row.day !== row.savedDay || row.time !== row.savedTime);
          return (
            <div key={row.key} className="rounded-lg border border-neutral-200 p-3">
              <div className="grid gap-2 sm:grid-cols-[9.5rem_1fr_9.5rem_7rem_auto]">
                <select value={row.kind} onChange={(e) => update(row.key, { kind: e.target.value })} className={input} aria-label="Event type">
                  {EVENT_KINDS.map((k) => (
                    <option key={k.code} value={k.code}>{k.label}</option>
                  ))}
                </select>
                <input type="text" value={row.label} maxLength={120} onChange={(e) => update(row.key, { label: e.target.value })} placeholder="Name, e.g. Prelims exam" className={input} aria-label="Event name" />
                <input type="date" value={row.day} onChange={(e) => update(row.key, { day: e.target.value, ...(e.target.value ? {} : { time: '' }) })} className={input} aria-label="Date" />
                <input type="time" value={row.time} disabled={!row.day} onChange={(e) => update(row.key, { time: e.target.value })} className={`${input} disabled:bg-neutral-100`} aria-label="Time (optional)" />
                <button type="button" onClick={() => onChange(rows.filter((r) => r.key !== row.key))} aria-label="Remove event" className="justify-self-end rounded-md p-2 text-neutral-400 hover:bg-red-50 hover:text-danger">
                  <Trash2 size={14} />
                </button>
              </div>

              {!row.day && row.id && <p className="mt-1.5 text-[11px] text-amber-700">No date: this event shows as &quot;Date to be announced&quot;.</p>}

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
    </div>
  );
}
