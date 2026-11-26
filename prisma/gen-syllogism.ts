import fs from 'fs';
import { SYLL_LABELS, makeSyllogism, syllExplain, syllStem } from '../lib/qb/choice/syllogism';
import { validateFixed } from '../lib/qb/fixed';

// Usage: npx tsx prisma/gen-syllogism.ts <how many> [first index]. Answer i % 5, so each answer is equally common.
const count = Number(process.argv[2]);
const start = Number(process.argv[3] ?? 0);
if (!(count >= 1)) { console.error('Usage: npx tsx prisma/gen-syllogism.ts <how many> [first index]'); process.exit(1); }
const items: Record<string, unknown>[] = [];
const perClass = [0, 0, 0, 0, 0];
let skipped = 0;
for (let i = start; i < start + count; i++) {
  const p = makeSyllogism('syll-' + i, i % 5);
  if (!p) { skipped++; continue; }
  const q = { text: syllStem(p), options: SYLL_LABELS, correctIndex: p.verdict, explanation: syllExplain(p), ordered: true };
  if (validateFixed(q).length) { skipped++; continue; }
  perClass[p.verdict]++;
  items.push({ chapter: 'Logical Reasoning', topic: 'Syllogism', difficulty: p.terms.length >= 4 ? 'HARD' : 'MEDIUM', seconds: 80, ...q, source: 'generated, verdict checked by exhaustive model search' });
}
fs.mkdirSync('docs/question-batches', { recursive: true });
const file = 'docs/question-batches/gen-syllogism-' + start + '-' + (start + count - 1) + '.json';
fs.writeFileSync(file, JSON.stringify(items, null, 1));
console.log(items.length + ' questions written to ' + file + ' (' + skipped + ' skipped). Per answer: ' + perClass.join(', '));
