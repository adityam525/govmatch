import { activeSection, clientView, expiresAtMs, finalize, isExpired, isTimed, mergeAnswers, type Snapshot } from '../lib/mock-attempt';

const results: [string, boolean][] = [];
const check = (name: string, ok: boolean) => results.push([name, ok]);

const q = (id: string, correct: number) => ({ id, text: id, options: ['a', 'b', 'c', 'd'], correctIndex: correct, marks: 2, negativeMarks: 0.5, explanation: 'why' });
const timed: Snapshot = { title: 'T', durationMinutes: 30, sections: [
  { name: 'A', durationMinutes: 10, questions: [q('a1', 0)] },
  { name: 'B', durationMinutes: 20, questions: [q('b1', 1)] },
] };
const untimed: Snapshot = { title: 'T', durationMinutes: 30, sections: [
  { name: 'A', durationMinutes: null, questions: [q('a1', 0)] },
  { name: 'B', durationMinutes: null, questions: [q('b1', 1)] },
] };
const MIN = 60_000;
const T0 = 1_000_000_000_000;
const ans = (selected: number) => ({ selected, marked: false, visited: true, timeSec: 5 });

check('all sections timed means timed', isTimed(timed) && !isTimed(untimed));
check('a mix is not treated as timed', !isTimed({ ...timed, sections: [timed.sections[0], { ...timed.sections[1], durationMinutes: null }] }));
check('timed: the end is the sum of the sections', expiresAtMs(timed, T0) === T0 + 30 * MIN);
check('untimed: the end uses the overall time', expiresAtMs(untimed, T0) === T0 + 30 * MIN);
check('section A is open at the start', activeSection(timed, T0, T0) === 0);
check('section A is open just before it ends', activeSection(timed, T0, T0 + 10 * MIN - 1) === 0);
check('section B opens when A ends', activeSection(timed, T0, T0 + 10 * MIN) === 1);
check('nothing is open after the end', activeSection(timed, T0, T0 + 30 * MIN) === null);
check('untimed has no active section', activeSection(untimed, T0, T0 + MIN) === null);
check('expiry is exact', !isExpired(timed, T0, T0 + 30 * MIN - 1) && isExpired(timed, T0, T0 + 30 * MIN));

const early = mergeAnswers(timed, T0, T0 + MIN, {}, { a1: ans(0), b1: ans(1) }) as any;
check('timed: a locked-ahead section is ignored', early.a1?.selected === 0 && early.b1 === undefined);
const late = mergeAnswers(timed, T0, T0 + 12 * MIN, { a1: ans(0) }, { a1: ans(3), b1: ans(1) }) as any;
check('timed: a finished section cannot be changed', late.a1.selected === 0 && late.b1.selected === 1);
const grace = mergeAnswers(timed, T0, T0 + 10 * MIN + 3_000, {}, { a1: ans(2) }) as any;
check('timed: a save just after a section ends is still accepted', grace.a1?.selected === 2);
check('untimed: any question can be saved', Object.keys(mergeAnswers(untimed, T0, T0 + MIN, {}, { a1: ans(0), b1: ans(1) }) as object).length === 2);
check('saving long after the end is refused', mergeAnswers(untimed, T0, T0 + 30 * MIN + 16_000, {}, { a1: ans(0) }) === null);
check('saving just after the end is allowed', mergeAnswers(untimed, T0, T0 + 30 * MIN + 5_000, {}, { a1: ans(0) }) !== null);
check('a made-up question id is dropped', !('zzz' in (mergeAnswers(untimed, T0, T0, {}, { zzz: ans(0) }) as object)));

const r = finalize(untimed, { a1: ans(0), b1: ans(3) });
check('scoring: right answer 2, wrong -0.5', r.score === 1.5 && r.correct === 1 && r.wrong === 1);

const hidden = JSON.stringify(clientView(untimed, false));
check('answers are hidden while the test runs', !hidden.includes('correctIndex') && !hidden.includes('why'));
check('answers are shown after submitting', JSON.stringify(clientView(untimed, true)).includes('correctIndex'));

let failed = 0;
for (const [name, ok] of results) { if (!ok) failed++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); }
console.log(`\n${results.length - failed} of ${results.length} cases passed.`);
if (failed > 0) process.exit(1);
