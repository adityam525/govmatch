import { roundTo } from '../lib/qb/expr';
import { generate, validateTemplate } from '../lib/qb/template';
import { QB_SUBJECTS } from './data/qb-taxonomy';
import { STARTERS } from './data/qb-starters';

let failed = 0;
const topics = new Set(QB_SUBJECTS.flatMap((s) => s.chapters.flatMap((c) => c.topics.map((t) => c.name + '|' + t))));
const slugs = new Set<string>();
console.log('Template'.padEnd(34) + 'draws ok   tries  independent check');

for (const s of STARTERS) {
  const problems: string[] = [];
  if (slugs.has(s.slug)) problems.push('duplicate slug');
  slugs.add(s.slug);
  if (!topics.has(s.chapter + '|' + s.topic)) problems.push('topic not in taxonomy: ' + s.chapter + ' / ' + s.topic);

  const rep = validateTemplate(s.def);
  if (!rep.ok) problems.push(...rep.errors);

  let wrong = 0, made = 0;
  for (let i = 0; i < 100; i++) {
    const g = generate(s.def, 'verify-' + s.slug + '-' + i);
    if (!g.ok) { wrong++; continue; }
    made++;
    const expected = roundTo(s.verify(g.q.values), s.def.answer.decimals);
    const shown = Number(g.q.options[g.q.correctIndex]);
    if (Math.abs(expected - shown) > 1e-6) wrong++;
    if (new Set(g.q.options).size !== 4) wrong++;
    if (/[{}]/.test(g.q.text + g.q.explanation)) wrong++;
  }
  if (wrong > 0) problems.push(wrong + ' of 100 draws disagreed with the independent check');

  const line = s.slug.padEnd(34) + (String(rep.accepted) + '/' + rep.draws).padEnd(10) + String(rep.averageTries).padEnd(7) + (wrong === 0 ? 'all ' + made + ' match' : 'MISMATCH');
  console.log(line + (rep.warnings.length ? '  warn: ' + rep.warnings.join(' ') : ''));
  if (problems.length) { failed++; problems.forEach((p) => console.log('    PROBLEM: ' + p)); }
}
console.log('\n' + (STARTERS.length - failed) + ' of ' + STARTERS.length + ' templates passed.');
if (failed > 0) process.exit(1);
