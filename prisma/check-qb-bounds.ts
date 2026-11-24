import { generate, type TemplateDef } from '../lib/qb/template';
import { STARTERS } from './data/qb-starters';
import { BOUNDS } from './data/qb-bounds';

let failed = 0;
for (const [slug, [lo, hi]] of Object.entries(BOUNDS)) {
  const st = STARTERS.find((s) => s.slug === slug);
  if (!st) { failed++; console.log('FAIL  ' + slug + ': no such template'); continue; }
  let bad = '', made = 0;
  for (let i = 0; i < 150 && !bad; i++) {
    const r = generate(st.def as unknown as TemplateDef, 'bounds-' + slug + '-' + i);
    if (!r.ok) continue;
    made++;
    for (const o of r.q.options) { const v = parseFloat(o); if (v < lo || v > hi) { bad = r.q.text.slice(0, 50) + ' -> option ' + o; break; } }
  }
  if (bad || made === 0) { failed++; console.log('FAIL  ' + slug + ' [' + lo + ', ' + hi + ']: ' + (bad || 'no questions could be made')); }
  else console.log('PASS  ' + slug + ' stays inside [' + lo + ', ' + hi + ']');
}
console.log('\n' + (failed ? failed + ' failed.' : 'All bounded templates stay inside their range.'));
if (failed) process.exit(1);
