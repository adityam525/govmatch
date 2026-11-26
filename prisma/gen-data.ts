import fs from 'fs';
import { dqOptions, makeTable, tableStem } from '../lib/qb/data/table';
import { validateFixed } from '../lib/qb/fixed';
import { rng } from '../lib/qb/random';

// Usage: npx tsx prisma/gen-data.ts <how many scenarios> [first index]. Each scenario gives up to five questions.
const count = Number(process.argv[2]);
const start = Number(process.argv[3] ?? 0);
if (!(count >= 1)) { console.error('Usage: npx tsx prisma/gen-data.ts <how many scenarios> [first index]'); process.exit(1); }
const items: Record<string, unknown>[] = [];
let skipped = 0;
for (let i = start; i < start + count; i++) {
  const ds = makeTable('table-' + i);
  if (!ds) { skipped++; continue; }
  for (const q of ds.questions) {
    const o = dqOptions(q, rng('opt-' + i + q.kind));
    if (!o) { skipped++; continue; }
    const fixed = { text: tableStem(ds) + ' ' + q.text, options: o.options, correctIndex: o.correctIndex, explanation: q.explanation };
    if (validateFixed(fixed).length) { skipped++; continue; }
    items.push({ chapter: 'Data Interpretation', topic: 'Tables', difficulty: q.hard ? 'HARD' : 'MEDIUM', seconds: 90, ...fixed, source: 'generated table, answer recomputed from the numbers' });
  }
}
fs.mkdirSync('docs/question-batches', { recursive: true });
const file = 'docs/question-batches/gen-data-table-' + start + '-' + (start + count - 1) + '.json';
fs.writeFileSync(file, JSON.stringify(items, null, 1));
console.log(items.length + ' questions written to ' + file + ' (' + skipped + ' skipped).');
