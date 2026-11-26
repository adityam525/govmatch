import fs from 'fs';
import { makeQuadratic } from '../lib/qb/choice/quadratic';
import { VERDICT_LABELS, ineqExplain, ineqStem, makeIneq } from '../lib/qb/choice/inequality';
import { validateFixed } from '../lib/qb/fixed';

// Usage: npx tsx prisma/gen-choice.ts <quadratic|inequality> <how many> [first index]
// Question i has the answer class (i % 5), so every answer appears equally often.
const kind = process.argv[2];
const count = Number(process.argv[3]);
const start = Number(process.argv[4] ?? 0);
if ((kind !== 'quadratic' && kind !== 'inequality') || !(count >= 1)) {
  console.error('Usage: npx tsx prisma/gen-choice.ts <quadratic|inequality> <how many> [first index]');
  process.exit(1);
}
type Q = { text: string; options: string[]; correctIndex: number; explanation: string; difficulty: string };
const items: Record<string, unknown>[] = [];
const perClass = [0, 0, 0, 0, 0];
let skipped = 0;
for (let i = start; i < start + count; i++) {
  const target = i % 5;
  const seed = kind + '-' + i;
  let q: Q | null = null;
  if (kind === 'quadratic') q = makeQuadratic(seed, target);
  else {
    const p = makeIneq(seed, target);
    if (p) q = { text: ineqStem(p), options: VERDICT_LABELS, correctIndex: p.verdict, explanation: ineqExplain(p), difficulty: p.letters >= 9 ? 'HARD' : 'MEDIUM' };
  }
  if (!q || validateFixed({ text: q.text, options: q.options, correctIndex: q.correctIndex, explanation: q.explanation, ordered: true }).length) { skipped++; continue; }
  perClass[q.correctIndex]++;
  items.push({
    chapter: kind === 'quadratic' ? 'Algebra' : 'Mathematical Reasoning',
    topic: kind === 'quadratic' ? 'Quadratic equations' : 'Inequalities',
    difficulty: q.difficulty, seconds: 75,
    text: q.text, options: q.options, correctIndex: q.correctIndex, explanation: q.explanation,
    ordered: true, source: 'generated, answer checked by solver',
  });
}
fs.mkdirSync('docs/question-batches', { recursive: true });
const file = 'docs/question-batches/gen-' + kind + '-' + start + '-' + (start + count - 1) + '.json';
fs.writeFileSync(file, JSON.stringify(items, null, 1));
console.log(items.length + ' questions written to ' + file + ' (' + skipped + ' skipped). Per answer: ' + perClass.join(', '));
