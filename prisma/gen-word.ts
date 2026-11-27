import fs from 'fs';
import { FAMILIES, makeWord } from '../lib/qb/word/word';
import { WORD_TOPICS } from './data/word-topics';
import { validateFixed } from '../lib/qb/fixed';

// Usage: npx tsx prisma/gen-word.ts <how many> [first index]. Question i uses family (i % 8), so all eight are equally common.
const count = Number(process.argv[2]);
const start = Number(process.argv[3] ?? 0);
if (!(count >= 1)) { console.error('Usage: npx tsx prisma/gen-word.ts <how many> [first index]'); process.exit(1); }
const items: Record<string, unknown>[] = [];
let skipped = 0;
for (let i = start; i < start + count; i++) {
  const fam = FAMILIES[i % FAMILIES.length];
  const q = makeWord('word-' + i, fam);
  if (!q) { skipped++; continue; }
  if (validateFixed({ text: q.text, options: q.options, correctIndex: q.correctIndex, explanation: q.explanation }).length) { skipped++; continue; }
  const [chapter, topic] = WORD_TOPICS[fam];
  items.push({ chapter, topic, difficulty: q.hard ? 'HARD' : 'MEDIUM', seconds: 90, text: q.text, options: q.options, correctIndex: q.correctIndex, explanation: q.explanation, source: 'generated, answer solved from the printed numbers' });
}
fs.mkdirSync('docs/question-batches', { recursive: true });
const file = 'docs/question-batches/gen-word-' + start + '-' + (start + count - 1) + '.json';
fs.writeFileSync(file, JSON.stringify(items, null, 1));
console.log(items.length + ' questions written to ' + file + ' (' + skipped + ' skipped).');
