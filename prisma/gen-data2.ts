import fs from 'fs';
import { makePie, pieQuestions, pieStem } from '../lib/qb/data/pie';
import { makeCaselet, caseletQuestions, caseletStem } from '../lib/qb/data/caselet';
import { makeSeries, seriesExplain, seriesOptions, seriesStem } from '../lib/qb/series/series';
import { validateFixed } from '../lib/qb/fixed';
import { rng } from '../lib/qb/random';

// Usage: npx tsx prisma/gen-data2.ts <pie|caselet|series> <how many scenarios> [first index]
const kind = process.argv[2];
const count = Number(process.argv[3]);
const start = Number(process.argv[4] ?? 0);
if (!['pie', 'caselet', 'series'].includes(kind) || !(count >= 1)) {
  console.error('Usage: npx tsx prisma/gen-data2.ts <pie|caselet|series> <how many scenarios> [first index]');
  process.exit(1);
}
const items: Record<string, unknown>[] = [];
let skipped = 0;
const add = (chapter: string, topic: string, hard: boolean, seconds: number, text: string, options: string[], correctIndex: number, explanation: string, source: string) => {
  if (validateFixed({ text, options, correctIndex, explanation }).length) { skipped++; return; }
  items.push({ chapter, topic, difficulty: hard ? 'HARD' : 'MEDIUM', seconds, text, options, correctIndex, explanation, source });
};
for (let i = start; i < start + count; i++) {
  const seed = kind + '-' + i;
  if (kind === 'pie') {
    const p = makePie(seed);
    if (!p) { skipped++; continue; }
    for (const q of pieQuestions(p, seed)) add('Data Interpretation', 'Pie charts', q.hard, 90, pieStem(p) + ' ' + q.text, q.options, q.correctIndex, q.explanation, 'generated pie data, answer recomputed from the numbers');
  } else if (kind === 'caselet') {
    const c = makeCaselet(seed);
    if (!c) { skipped++; continue; }
    for (const q of caseletQuestions(c, seed)) add('Data Interpretation', 'Caselets', q.hard, 90, caseletStem(c) + ' ' + q.text, q.options, q.correctIndex, q.explanation, 'generated caselet, answer recomputed from the numbers');
  } else {
    const s = makeSeries(seed);
    const o = s ? seriesOptions(s, rng('opt-' + seed)) : null;
    if (!s || !o) { skipped++; continue; }
    add('Number Series', 'Pattern series', s.hard, 75, seriesStem(s), o.options, o.correctIndex, seriesExplain(s), 'generated series, rule checked for ambiguity');
  }
}
fs.mkdirSync('docs/question-batches', { recursive: true });
const file = 'docs/question-batches/gen-' + kind + '-' + start + '-' + (start + count - 1) + '.json';
fs.writeFileSync(file, JSON.stringify(items, null, 1));
console.log(items.length + ' questions written to ' + file + ' (' + skipped + ' skipped).');
