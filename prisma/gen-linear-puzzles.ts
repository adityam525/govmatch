import fs from 'fs';
import { makePuzzle, questionsFor, stem } from '../lib/qb/puzzle/linear';
import { validateFixed } from '../lib/qb/fixed';

// Usage: npx tsx prisma/gen-linear-puzzles.ts <people 6-9> <how many puzzles> [first index]
const n = Number(process.argv[2]);
const count = Number(process.argv[3]);
const start = Number(process.argv[4] ?? 0);
if (!(n >= 6 && n <= 9) || !(count >= 1)) { console.error('Usage: npx tsx prisma/gen-linear-puzzles.ts <people 6-9> <how many puzzles> [first index]'); process.exit(1); }

const items: Record<string, unknown>[] = [];
let skipped = 0;
for (let i = start; i < start + count; i++) {
  const seed = 'lin-' + n + '-' + i;
  const p = makePuzzle(n, seed);
  if (!p) { skipped++; continue; }
  for (const q of questionsFor(p, seed)) {
    const fixed = { text: stem(p) + ' ' + q.text, options: q.options, correctIndex: q.correctIndex, explanation: q.explanation };
    if (validateFixed(fixed).length) { skipped++; continue; }
    items.push({ chapter: 'Arrangements and Puzzles', topic: 'Linear seating', difficulty: n >= 8 ? 'HARD' : 'MEDIUM', seconds: 75, ...fixed, source: 'generated puzzle, unique solution verified' });
  }
}
fs.mkdirSync('docs/question-batches', { recursive: true });
const file = 'docs/question-batches/gen-linear-' + n + 'p-' + start + '-' + (start + count - 1) + '.json';
fs.writeFileSync(file, JSON.stringify(items, null, 1));
console.log(items.length + ' questions written to ' + file + ' (' + skipped + ' skipped).');
