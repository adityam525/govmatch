import fs from 'fs';
import { approxText, makeApprox } from '../lib/qb/series/approx';
import { validateFixed } from '../lib/qb/fixed';

// Usage: npx tsx prisma/gen-approx.ts <how many> [first index]. Question i uses form (i % 6), so all six are equally common.
const count = Number(process.argv[2]);
const start = Number(process.argv[3] ?? 0);
if (!(count >= 1)) { console.error('Usage: npx tsx prisma/gen-approx.ts <how many> [first index]'); process.exit(1); }
const items: Record<string, unknown>[] = [];
let skipped = 0;
for (let i = start; i < start + count; i++) {
  const q = makeApprox('approx-' + i, i % 6);
  if (!q) { skipped++; continue; }
  const text = approxText(q);
  if (validateFixed({ text, options: q.options, correctIndex: q.correctIndex, explanation: q.explanation }).length) { skipped++; continue; }
  items.push({ chapter: 'Simplification and Approximation', topic: 'Approximation', difficulty: q.hard ? 'HARD' : 'MEDIUM', seconds: 60, text, options: q.options, correctIndex: q.correctIndex, explanation: q.explanation, source: 'generated, solved from the printed numbers' });
}
fs.mkdirSync('docs/question-batches', { recursive: true });
const file = 'docs/question-batches/gen-approx-' + start + '-' + (start + count - 1) + '.json';
fs.writeFileSync(file, JSON.stringify(items, null, 1));
console.log(items.length + ' questions written to ' + file + ' (' + skipped + ' skipped).');
