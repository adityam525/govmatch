import { classifyChange, describeChange, formatEventMoment, istDay, istTime, istToDate } from '../lib/schedule';

const results: [string, boolean][] = [];
const check = (name: string, ok: boolean) => results.push([name, ok]);

const evening = istToDate('2026-11-18', '17:00')!;
const endOfDay = istToDate('2026-11-18')!;
const later = istToDate('2026-12-03', '10:00')!;
const sameDayLater = istToDate('2026-11-18', '19:30')!;

check('5 PM IST is stored as 11:30 UTC', evening.toISOString() === '2026-11-18T11:30:00.000Z');
check('no time means end of that IST day', istTime(endOfDay) === '23:59' && istDay(endOfDay) === '2026-11-18');
check('IST day and time round trip', istDay(evening) === '2026-11-18' && istTime(evening) === '17:00');
check('an impossible day is rejected', istToDate('2026-02-31') === null);
check('a bad time is rejected', istToDate('2026-11-18', '25:00') === null);
check('a malformed day is rejected', istToDate('18-11-2026') === null);
check('format with time', formatEventMoment(evening, true) === '18 Nov 2026, 5:00 PM');
check('format without time', formatEventMoment(endOfDay, false) === '18 Nov 2026');
check('format with no date', formatEventMoment(null, false) === 'Date to be announced');

check('day moved later is a postponement', classifyChange(endOfDay, false, later, true) === 'POSTPONED');
check('day moved earlier is a preponement', classifyChange(later, true, endOfDay, false) === 'PREPONED');
check('same day, time added', classifyChange(endOfDay, false, evening, true) === 'TIME_ADDED');
check('same day, time moved later', classifyChange(evening, true, sameDayLater, true) === 'POSTPONED');
check('same day, time moved earlier', classifyChange(sameDayLater, true, evening, true) === 'PREPONED');
check('date cleared is a postponement', classifyChange(evening, true, null, false) === 'POSTPONED');
check('date announced after being blank is a postponement', classifyChange(null, false, later, false) === 'POSTPONED');
check('no change at all', classifyChange(evening, true, evening, true) === null);
check('time dropped on the same day is not a change', classifyChange(evening, true, endOfDay, false) === null);

const text = describeChange({
  kind: 'POSTPONED',
  oldAt: endOfDay,
  oldTimeKnown: false,
  newAt: later,
  newTimeKnown: true,
  reason: 'Due to elections',
  createdAt: new Date(),
});
check('postponement sentence', text === 'Postponed from 18 Nov 2026 to 03 Dec 2026, 10:00 AM (Due to elections)');
const tba = describeChange({ kind: 'POSTPONED', oldAt: endOfDay, oldTimeKnown: false, newAt: null, newTimeKnown: false, createdAt: new Date() });
check('postponed with no new date', tba === 'Postponed from 18 Nov 2026. New date to be announced');

let failed = 0;
for (const [name, ok] of results) {
  if (!ok) failed++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
}
console.log(`\n${results.length - failed} of ${results.length} cases passed.`);
if (failed > 0) process.exit(1);
