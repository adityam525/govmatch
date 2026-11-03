import { deadlinesSoon, groupByDay, icsFor, istDayKey, istTimeLabel, monthGrid, monthRange, shiftMonth, type CalendarEvent } from '../lib/exam-calendar';

const results: [string, boolean][] = [];
const check = (n: string, ok: boolean) => { results.push([n, ok]); };

const ev = (id: string, kind: string, at: string, timeKnown = false, extra: Partial<CalendarEvent> = {}): CalendarEvent =>
  ({ id, kind, label: kind === 'APPLICATION_CLOSE' ? 'Applications close' : 'Exam', at, timeKnown, jobTitle: 'SSC, CGL', jobSlug: 'ssc-cgl', postponed: false, ...extra });

check('month range starts at IST midnight', monthRange('2026-11')?.start.toISOString() === '2026-10-31T18:30:00.000Z');
check('month range ends at the next IST midnight', monthRange('2026-11')?.end.toISOString() === '2026-11-30T18:30:00.000Z');
check('a bad month gives null', monthRange('2026-13') === null && monthRange('abc') === null);
check('shift forward over a year end', shiftMonth('2026-12', 1) === '2027-01');
check('shift back over a year start', shiftMonth('2027-01', -1) === '2026-12');

const nov = monthGrid('2026-11');
check('November 2026 has 5 weeks starting on a Sunday', nov.length === 5 && nov[0][0] === '2026-11-01' && nov[4][1] === '2026-11-30');
check('every week has 7 cells', nov.every((w) => w.length === 7));
const dec = monthGrid('2026-12');
check('December 2026 starts on Tuesday (two blanks)', dec[0][0] === null && dec[0][1] === null && dec[0][2] === '2026-12-01');
check('February 2027 has 28 days', monthGrid('2027-02').flat().filter(Boolean).length === 28);

check('end-of-day IST stays on its own day', istDayKey('2026-11-12T18:29:59.000Z') === '2026-11-12');
check('IST time label', istTimeLabel('2026-11-12T11:30:00.000Z') === '5:00 PM');

const grouped = groupByDay([ev('b', 'EXAM', '2026-11-12T11:30:00.000Z', true), ev('a', 'APPLICATION_CLOSE', '2026-11-12T04:30:00.000Z', true), ev('c', 'EXAM', '2026-11-13T04:30:00.000Z', true)]);
check('events group by IST day, earliest first', grouped.get('2026-11-12')?.map((e) => e.id).join() === 'a,b' && grouped.get('2026-11-13')?.length === 1);

const now = Date.parse('2026-11-03T00:00:00.000Z');
const soon = deadlinesSoon([
  ev('in2', 'APPLICATION_CLOSE', '2026-11-05T00:00:00.000Z'), ev('in10', 'APPLICATION_CLOSE', '2026-11-13T00:00:00.000Z'),
  ev('exam', 'EXAM', '2026-11-04T00:00:00.000Z'), ev('past', 'APPLICATION_CLOSE', '2026-11-02T00:00:00.000Z'),
], now);
check('only closing dates within 7 days are listed', soon.map((e) => e.id).join() === 'in2');

const dateOnly = icsFor([ev('x1', 'APPLICATION_CLOSE', '2026-11-12T18:29:59.000Z')], 'https://site.in', new Date('2026-11-03T00:00:00Z'));
check('date-only event is an all-day entry', dateOnly.includes('DTSTART;VALUE=DATE:20261112') && dateOnly.includes('DTEND;VALUE=DATE:20261113'));
check('commas in the title are escaped', dateOnly.includes('SUMMARY:Applications close: SSC\\, CGL'));
check('the link points at the job', dateOnly.includes('URL:https://site.in/jobs/ssc-cgl'));
const timed = icsFor([ev('x2', 'EXAM', '2026-11-12T11:30:00.000Z', true)], 'https://site.in', new Date('2026-11-03T00:00:00Z'));
check('a timed event uses UTC start and one hour end', timed.includes('DTSTART:20261112T113000Z') && timed.includes('DTEND:20261112T123000Z'));
check('postponed events say so', icsFor([ev('x3', 'EXAM', '2026-11-12T11:30:00.000Z', true, { postponed: true })], 's').includes('DESCRIPTION:This date was postponed'));
const longTitle = icsFor([ev('x4', 'EXAM', '2026-11-12T11:30:00.000Z', true, { jobTitle: 'A'.repeat(200) })], 's');
check('long lines are folded to 75 characters', longTitle.split('\r\n').every((l) => l.length <= 75));
check('lines end with CRLF and the calendar is closed', longTitle.endsWith('END:VCALENDAR\r\n'));

let failed = 0;
for (const [n, ok] of results) { if (!ok) failed++; console.log((ok ? 'PASS' : 'FAIL') + '  ' + n); }
console.log('\n' + (results.length - failed) + ' of ' + results.length + ' cases passed.');
if (failed > 0) process.exit(1);
