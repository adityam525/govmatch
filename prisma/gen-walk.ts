import fs from 'fs';
import { dirQuestions, makeWalk, walkText } from '../lib/qb/direction/walk';
import { validateFixed } from '../lib/qb/fixed';

// Usage: npx tsx prisma/gen-walk.ts <how many walks> [first index]. Each walk gives up to four questions.
const count = Number(process.argv[2]);
const start = Number(process.argv[3] ?? 0);
if (!(count >= 1)) { console.error('Usage: npx tsx prisma/gen-walk.ts <how many walks> [first index]'); process.exit(1); }
const items: Record<string, unknown>[] = [];
let skipped = 0;
for (let i = start; i < start + count; i++) {
  const w = makeWalk('walk-' + i);
  if (!w) { skipped++; continue; }
  for (const q of dirQuestions(w, 'walk-' + i)) {
    const text = walkText(w) + ' ' + q.text;
    if (validateFixed({ text, options: q.options, correctIndex: q.correctIndex, explanation: q.explanation }).length) { skipped++; continue; }
    items.push({ chapter: 'Relations and Direction', topic: 'Direction sense', difficulty: q.hard ? 'HARD' : 'MEDIUM', seconds: 75, text, options: q.options, correctIndex: q.correctIndex, explanation: q.explanation, source: 'generated walk, positions checked two ways' });
  }
}
fs.mkdirSync('docs/question-batches', { recursive: true });
const file = 'docs/question-batches/gen-walk-' + start + '-' + (start + count - 1) + '.json';
fs.writeFileSync(file, JSON.stringify(items, null, 1));
console.log(items.length + ' questions written to ' + file + ' (' + skipped + ' skipped).');
