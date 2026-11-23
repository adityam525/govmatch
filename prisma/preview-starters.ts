import { generate, type TemplateDef } from '../lib/qb/template';
import { STARTERS_E } from './data/qb-starter-e';

for (const st of STARTERS_E) {
  console.log('\n== ' + st.chapter + ' / ' + st.topic + '  [' + st.slug + ']');
  for (const seed of ['one', 'two']) {
    const r = generate(st.def as unknown as TemplateDef, seed);
    if (!r.ok) { console.log('   (no question: ' + r.reason + ')'); continue; }
    console.log('Q: ' + r.q.text);
    console.log('   ' + r.q.options.map((o, i) => String.fromCharCode(65 + i) + ') ' + o).join('   ') + '    answer: ' + String.fromCharCode(65 + r.q.correctIndex));
    console.log('   why: ' + r.q.explanation);
  }
}
