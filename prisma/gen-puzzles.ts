import fs from 'fs';
import { lineQuestions, lineStem, makeLine } from '../lib/qb/puzzle/line';
import { circQuestions, circStem, makeCirc } from '../lib/qb/puzzle/circle';
import { validateFixed } from '../lib/qb/fixed';

// Usage: npx tsx prisma/gen-puzzles.ts <stack|height|circle> <people 6-9> <how many puzzles> [first index]
const kind = process.argv[2];
const n = Number(process.argv[3]);
const count = Number(process.argv[4]);
const start = Number(process.argv[5] ?? 0);
const WHERE: Record<string, [string, string]> = {
  stack: ['Arrangements and Puzzles', 'Floor and box puzzles'],
  height: ['Relations and Direction', 'Ranking and order'],
  circle: ['Arrangements and Puzzles', 'Circular seating'],
};
if (!WHERE[kind] || !(n >= 5 && n <= 9) || !(count >= 1)) {
  console.error('Usage: npx tsx prisma/gen-puzzles.ts <stack|height|circle> <people 6-9> <how many puzzles> [first index]');
  process.exit(1);
}
const [chapter, topic] = WHERE[kind];
const items: Record<string, unknown>[] = [];
let skipped = 0;
for (let i = start; i < start + count; i++) {
  const seed = kind + '-' + n + '-' + i;
  let stem = ''; let qs: { text: string; options: string[]; correctIndex: number; explanation: string }[] = [];
  if (kind === 'circle') { const p = makeCirc(n, seed); if (p) { stem = circStem(p); qs = circQuestions(p, seed); } }
  else { const p = makeLine(kind as 'stack' | 'height', n, seed); if (p) { stem = lineStem(p); qs = lineQuestions(p, seed); } }
  if (!stem) { skipped++; continue; }
  for (const q of qs) {
    const fixed = { text: stem + ' ' + q.text, options: q.options, correctIndex: q.correctIndex, explanation: q.explanation };
    if (validateFixed(fixed).length) { skipped++; continue; }
    items.push({ chapter, topic, difficulty: n >= 8 ? 'HARD' : 'MEDIUM', seconds: 75, ...fixed, source: 'generated puzzle, unique solution verified' });
  }
}
fs.mkdirSync('docs/question-batches', { recursive: true });
const file = 'docs/question-batches/gen-' + kind + '-' + n + 'p-' + start + '-' + (start + count - 1) + '.json';
fs.writeFileSync(file, JSON.stringify(items, null, 1));
console.log(items.length + ' questions written to ' + file + ' (' + skipped + ' skipped).');
