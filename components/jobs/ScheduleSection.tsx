import { CalendarClock } from 'lucide-react';
import Card from '@/components/ui/Card';
import { formatEventMoment } from '@/lib/schedule';
import type { JobScheduleView } from '@/lib/schedule-queries';

export default function ScheduleSection({ schedule }: { schedule: JobScheduleView }) {
  if (schedule.events.length === 0) return null;

  return (
    <Card padding="lg">
      <div className="mb-4 flex items-center gap-2">
        <CalendarClock size={18} className="text-primary-600" />
        <h2 className="text-sm font-bold text-neutral-900">Schedule</h2>
        {schedule.recentlyChanged && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">Recently postponed</span>
        )}
      </div>

      <div className="space-y-3">
        {schedule.events.map((event) => (
          <div key={event.id} className="rounded-lg border border-neutral-200 p-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <p className="text-sm font-medium text-neutral-900">{event.label}</p>
              <p className={`text-sm font-semibold ${event.at ? 'text-neutral-900' : 'text-amber-700'}`}>
                {formatEventMoment(event.at, event.timeKnown)}
                {event.at && !event.timeKnown && <span className="ml-1 text-[11px] font-normal text-neutral-400">time not announced</span>}
              </p>
            </div>
            {event.postponed && event.lastChange && (
              <p className="mt-1.5 rounded-md bg-amber-50 px-2 py-1 text-xs text-amber-800">{event.lastChange}</p>
            )}
            {event.history.length > 1 && (
              <details className="mt-1.5">
                <summary className="cursor-pointer text-[11px] text-neutral-500">Change history ({event.history.length - 1})</summary>
                <ul className="mt-1 space-y-0.5">
                  {event.history.map((h, i) => (
                    <li key={i} className="text-[11px] text-neutral-500">
                      {new Date(h.when).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' })}
                      {': '}
                      {h.text}
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-neutral-400">Times are in IST. Always confirm dates on the official notification.</p>
    </Card>
  );
}
