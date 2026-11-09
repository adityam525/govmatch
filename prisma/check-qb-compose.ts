import { allocate, composeTest, type PoolTemplate } from '../lib/qb/compose';
import type { TemplateDef } from '../lib/qb/template';
import { STARTERS } from './data/qb-starters';

const results: [string, boolean][] = [];
const check = (n: string, ok: boolean) => { results.push([n, ok]); };
const sum = (o: Record<string, number>) => Object.values(o).reduce((a, b) => a + b, 0);

check('allocate always adds up', [1, 7, 10, 33, 100].every((n) => sum(allocate(n, { EASY: 30, MEDIUM: 50, HARD: 20 })) === n));
check('allocate follows the weights', JSON.stringify(allocate(10, { EASY: 30, MEDIUM: 50, HARD: 20 })) === '{"EASY":3,"MEDIUM":5,"HARD":2}');
check('allocate gives nothing to a zero weight', allocate(10, { EASY: 1, MEDIUM: 0, HARD: 1 }).MEDIUM === 0);
check('allocate handles all-zero weights', sum(allocate(10, { EASY: 0, MEDIUM: 0 })) === 0);

const pool: PoolTemplate[] = STARTERS.map((s) => ({ id: s.slug, title: s.title, difficulty: s.difficulty, expectedSeconds: s.seconds, def: s.def }));
const cfg = { count: 20, mix: { EASY: 30, MEDIUM: 50, HARD: 20 }, marks: 2, negativeMarks: 0.5, seed: 'test-1' };
const a = composeTest(pool, cfg);
const b = composeTest(pool, cfg);
check('a 20-question test is composed', a.ok && a.questions.length === 20 && a.shortfall === 0);
check('the same seed gives the same test', JSON.stringify(a) === JSON.stringify(b));
check('a different seed gives a different test', JSON.stringify(a) !== JSON.stringify(composeTest(pool, { ...cfg, seed: 'test-2' })));
if (a.ok) {
  check('difficulty counts follow the mix', ['EASY', 'MEDIUM', 'HARD'].map((l) => a.questions.filter((q) => q.difficulty === l).length).join() === '6,10,4');
  check('question ids are unique', new Set(a.questions.map((q) => q.id)).size === 20);
  check('question texts are unique', new Set(a.questions.map((q) => q.text)).size === 20);
  check('marks and negative marks are applied', a.questions.every((q) => q.marks === 2 && q.negativeMarks === 0.5));
  check('every question has four unique options and a valid answer', a.questions.every((q) => q.options.length === 4 && new Set(q.options).size === 4 && q.correctIndex >= 0 && q.correctIndex < 4));
  check('time defaults to the sum of expected times', a.durationMinutes === Math.max(1, Math.ceil(a.questions.reduce((n, q) => n + q.seconds, 0) / 60)));
}
const timed = composeTest(pool, { ...cfg, durationMinutes: 25 });
check('a chosen time wins', timed.ok && timed.durationMinutes === 25);

const onlyHard = composeTest(pool.filter((t) => t.difficulty === 'HARD'), cfg);
check('a missing level passes its share to the others', onlyHard.ok && onlyHard.questions.length === 20 && onlyHard.questions.every((q) => q.difficulty === 'HARD'));

const tiny: TemplateDef = { text: 'Double {a}.', variables: [{ name: 'a', kind: 'choice', choices: [10, 20] }], derived: [], constraints: [], answer: { expr: 'a * 2', decimals: 0 }, distractors: ['a * 3', 'a * 4', 'a * 5'], explanation: '' };
const short = composeTest([{ id: 't', title: 't', difficulty: 'EASY', expectedSeconds: 30, def: tiny }], { ...cfg, count: 10 });
check('too few distinct questions reports a shortfall', short.ok && short.questions.length === 2 && short.shortfall === 8);
check('an empty pool is refused', !composeTest([], cfg).ok);
check('a count of 0 or 101 is refused', !composeTest(pool, { ...cfg, count: 0 }).ok && !composeTest(pool, { ...cfg, count: 101 }).ok);

let failed = 0;
for (const [n, ok] of results) { if (!ok) failed++; console.log((ok ? 'PASS' : 'FAIL') + '  ' + n); }
console.log('\n' + (results.length - failed) + ' of ' + results.length + ' cases passed.');
if (failed > 0) process.exit(1);
