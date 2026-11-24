import { generate, type TemplateDef } from '../lib/qb/template';
import { evalExpr, roundTo } from '../lib/qb/expr';
import { STARTERS } from './data/qb-starters';

// An option that is neither the answer nor one of the template's own wrong-answer formulas is filler
// invented by the engine. Filler is often easy to rule out, so list every template that uses it.
const num = (o: string) => parseFloat(String(o).replace(/[^0-9.\-]/g, ''));
let flagged = 0;
for (const st of STARTERS) {
  const def = st.def as unknown as TemplateDef;
  let filler = 0, total = 0, example = '';
  for (let i = 0; i < 80; i++) {
    const r = generate(def, 'audit-' + st.slug + '-' + i);
    if (!r.ok) continue;
    const env: Record<string, number> = { ...r.q.values };
    try { for (const d of def.derived) env[d.name] = evalExpr(d.expr, env); } catch { continue; }
    total++;
    const dec = def.answer.decimals;
    const known = new Set<number>([roundTo(r.q.answer, dec)]);
    for (const e of def.distractors) { try { known.add(roundTo(evalExpr(e, env), dec)); } catch { /* skip */ } }
    if (r.q.options.some((o) => !known.has(num(o)))) { filler++; if (!example) example = r.q.text.slice(0, 70) + '  ->  ' + r.q.options.join(' | '); }
  }
  if (filler > 0) { flagged++; console.log(st.slug.padEnd(34) + filler + ' of ' + total + ' draws use filler\n   e.g. ' + example); }
}
console.log('\n' + flagged + ' of ' + STARTERS.length + ' templates use filler options.');
