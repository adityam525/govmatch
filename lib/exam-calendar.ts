export interface CalendarEvent {
  id: string; kind: string; label: string; at: string; timeKnown: boolean;
  jobTitle: string; jobSlug: string; postponed: boolean;
}

const IST_MS = 19_800_000;
const DAY_MS = 86_400_000;

export const istDayKey = (d: Date | string) => new Date(new Date(d).getTime() + IST_MS).toISOString().slice(0, 10);

export function istTimeLabel(d: Date | string): string {
  const t = new Date(new Date(d).getTime() + IST_MS);
  let h = t.getUTCHours();
  const m = String(t.getUTCMinutes()).padStart(2, '0');
  const ap = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return h + ':' + m + ' ' + ap;
}

export const currentMonth = () => istDayKey(new Date()).slice(0, 7);

const parse = (month: string) => {
  const m = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(month);
  return m ? { y: Number(m[1]), m: Number(m[2]) } : null;
};

/** The instants that bound an IST calendar month, or null for a bad month string. */
export function monthRange(month: string): { start: Date; end: Date } | null {
  const p = parse(month);
  if (!p) return null;
  return { start: new Date(Date.UTC(p.y, p.m - 1, 1) - IST_MS), end: new Date(Date.UTC(p.y, p.m, 1) - IST_MS) };
}

export function shiftMonth(month: string, delta: number): string {
  const p = parse(month);
  if (!p) return month;
  const d = new Date(Date.UTC(p.y, p.m - 1 + delta, 1));
  return d.toISOString().slice(0, 7);
}

/** Weeks (Sunday first) of day keys, with null for the blank cells before and after the month. */
export function monthGrid(month: string): (string | null)[][] {
  const p = parse(month);
  if (!p) return [];
  const lead = new Date(Date.UTC(p.y, p.m - 1, 1)).getUTCDay();
  const days = new Date(Date.UTC(p.y, p.m, 0)).getUTCDate();
  const cells: (string | null)[] = Array(lead).fill(null);
  for (let d = 1; d <= days; d++) cells.push(month + '-' + String(d).padStart(2, '0'));
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (string | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

export function groupByDay(events: CalendarEvent[]): Map<string, CalendarEvent[]> {
  const map = new Map<string, CalendarEvent[]>();
  const sorted = [...events].sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
  for (const e of sorted) {
    const key = istDayKey(e.at);
    map.set(key, [...(map.get(key) ?? []), e]);
  }
  return map;
}

/** Application deadlines from now until `days` days ahead. */
export function deadlinesSoon(events: CalendarEvent[], nowMs: number, days = 7): CalendarEvent[] {
  return events
    .filter((e) => e.kind === 'APPLICATION_CLOSE')
    .filter((e) => { const t = new Date(e.at).getTime(); return t >= nowMs && t <= nowMs + days * DAY_MS; })
    .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
}

const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
const nextDay = (key: string) => new Date(new Date(key + 'T00:00:00Z').getTime() + DAY_MS).toISOString().slice(0, 10);

// Lines longer than 75 characters are continued on the next line, starting with a space.
function fold(line: string): string[] {
  const out = [line.slice(0, 75)];
  let rest = line.slice(75);
  while (rest.length > 0) { out.push(' ' + rest.slice(0, 74)); rest = rest.slice(74); }
  return out;
}

export function icsFor(events: CalendarEvent[], site: string, now: Date = new Date()): string {
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//GovMatch//Exam calendar//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH'];
  for (const e of events) {
    const at = new Date(e.at);
    lines.push('BEGIN:VEVENT', 'UID:' + e.id + '@govmatch', 'DTSTAMP:' + stamp(now));
    if (e.timeKnown) {
      lines.push('DTSTART:' + stamp(at), 'DTEND:' + stamp(new Date(at.getTime() + 3_600_000)));
    } else {
      const day = istDayKey(at);
      lines.push('DTSTART;VALUE=DATE:' + day.replace(/-/g, ''), 'DTEND;VALUE=DATE:' + nextDay(day).replace(/-/g, ''));
    }
    lines.push('SUMMARY:' + esc(e.label + ': ' + e.jobTitle), 'URL:' + site + '/jobs/' + e.jobSlug);
    if (e.postponed) lines.push('DESCRIPTION:' + esc('This date was postponed. Check the official notice.'));
    lines.push('END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  return lines.flatMap((l) => fold(l)).join('\r\n') + '\r\n';
}
