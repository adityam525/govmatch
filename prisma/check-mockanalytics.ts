import { minutesTaken, percentOf, summarize, type HistoryItem } from '../lib/mock-analytics';

const results: [string, boolean][] = [];
const check = (n: string, ok: boolean) => results.push([n, ok]);

const sec = (name: string, correct: number, wrong: number, unattempted: number, score: number, maxScore: number) => ({ name, correct, wrong, unattempted, score, maxScore });
const item = (id: string, day: number, score: number, maxScore: number, accuracy: number | null, sections = [sec('Maths', 3, 1, 0, 5, 8), sec('English', 1, 3, 0, -1, 8)]): HistoryItem => ({
  id, testId: 't', title: `Test ${id}`, startedAt: new Date(2026, 0, day, 10).toISOString(), submittedAt: new Date(2026, 0, day, 11).toISOString(),
  score, maxScore, correct: 0, wrong: 0, unattempted: 0, accuracy, sections,
});

check('no attempts gives null', summarize([]) === null);
check('percent of a score', percentOf(30, 40) === 75 && percentOf(0, 0) === 0);
check('negative scores give a negative percent', percentOf(-2, 40) === -5);
check('minutes taken', minutesTaken(new Date(2026, 0, 1, 10).toISOString(), new Date(2026, 0, 1, 11, 30).toISOString()) === 90);

const one = summarize([item('a', 1, 20, 40, 80)])!;
check('one attempt: no change figure', one.change === null && one.count === 1);
check('one attempt: average equals best equals latest', one.averagePercent === 50 && one.bestPercent === 50 && one.latestPercent === 50);

const three = summarize([item('c', 3, 30, 40, 90), item('a', 1, 10, 40, 60), item('b', 2, 20, 40, 75)])!;
check('attempts are ordered by date, not input order', three.trend.map((t) => t.id).join() === 'a,b,c');
check('average of 25, 50, 75 is 50', three.averagePercent === 50);
check('best and latest', three.bestPercent === 75 && three.latestPercent === 75);
check('change is latest minus the earlier average (75 - 37.5)', three.change === 37.5);
check('average accuracy', three.averageAccuracy === 75);

const many = summarize(Array.from({ length: 14 }, (_, i) => item(`x${i}`, i + 1, 10, 40, 50)))!;
check('the trend keeps the last 10', many.trend.length === 10 && many.trend[0].id === 'x4');

check('sections add up across attempts', three.sections.find((s) => s.name === 'Maths')?.correct === 9);
check('section accuracy is correct over attempted (3 of 4 is 75)', three.sections.find((s) => s.name === 'Maths')?.accuracy === 75);
check('strongest and weakest sections', three.strongest?.name === 'Maths' && three.weakest?.name === 'English');
check('one section only gives no strongest or weakest', summarize([item('a', 1, 5, 8, 75, [sec('Maths', 3, 1, 0, 5, 8)])])!.strongest === null);
check('section names match ignoring case and spaces', summarize([item('a', 1, 5, 8, 75, [sec('Maths', 1, 0, 0, 1, 1)]), item('b', 2, 5, 8, 75, [sec(' maths ', 1, 0, 0, 1, 1)])])!.sections.length === 1);
check('a section with nothing attempted has no accuracy', summarize([item('a', 1, 0, 8, null, [sec('A', 0, 0, 4, 0, 8), sec('B', 2, 0, 0, 4, 4)])])!.sections.find((s) => s.name === 'A')?.accuracy === null);
check('null accuracies are skipped in the average', summarize([item('a', 1, 5, 8, null), item('b', 2, 5, 8, 80)])!.averageAccuracy === 80);

let failed = 0;
for (const [n, ok] of results) { if (!ok) failed++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}`); }
console.log(`\n${results.length - failed} of ${results.length} cases passed.`);
if (failed > 0) process.exit(1);
