import { coerceDefinition } from '../lib/qb/template-input';
import { validateTemplate } from '../lib/qb/template';

const results: [string, boolean][] = [];
const check = (n: string, ok: boolean) => { results.push([n, ok]); };

const good = {
  text: 'Double {a}.', variables: [{ name: 'a', kind: 'int', min: '10', max: '30', step: '', decimals: '' }],
  derived: [{ name: '', expr: '' }], constraints: ['', 'a > 0'], answer: { expr: 'a * 2', decimals: '0', unit: '' },
  distractors: ['a * 3', ''], explanation: '{a} x 2 = {answer}.',
};
const r: any = coerceDefinition(good);
check('a form-shaped definition is accepted', 'def' in r);
check('numbers typed as text become numbers', r.def?.variables[0].min === 10 && r.def?.variables[0].max === 30 && r.def?.answer.decimals === 0);
check('an empty step is left out, not zero', r.def?.variables[0].step === undefined);
check('blank rows are dropped', r.def?.derived.length === 0 && r.def?.constraints.length === 1 && r.def?.distractors.length === 1);
check('the coerced definition passes the report', validateTemplate(r.def).ok);

const choice: any = coerceDefinition({ ...good, variables: [{ name: 'a', kind: 'choice', choices: '5, 10, 15' }] });
check('choices may be typed as a comma list', choice.def?.variables[0].choices.join() === '5,10,15');
check('an unknown variable type is refused', 'error' in (coerceDefinition({ ...good, variables: [{ name: 'a', kind: 'text' }] }) as object));
check('a non-number min survives to be caught by the report', (() => { const d: any = coerceDefinition({ ...good, variables: [{ name: 'a', kind: 'int', min: 'x', max: 5 }] }); return 'def' in d && !validateTemplate(d.def).ok; })());
check('too many variables is refused', 'error' in (coerceDefinition({ ...good, variables: Array.from({ length: 13 }, (_, i) => ({ name: 'v' + i, kind: 'int', min: 1, max: 2 })) }) as object));
check('a missing definition is refused', 'error' in (coerceDefinition(null) as object) && 'error' in (coerceDefinition([]) as object));
check('a very long text is refused', 'error' in (coerceDefinition({ ...good, text: 'x'.repeat(2001) }) as object));
check('allowNegative must be exactly true', (coerceDefinition({ ...good, answer: { expr: 'a', decimals: 0, allowNegative: 'yes' } }) as any).def.answer.allowNegative === false);

let failed = 0;
for (const [n, ok] of results) { if (!ok) failed++; console.log((ok ? 'PASS' : 'FAIL') + '  ' + n); }
console.log('\n' + (results.length - failed) + ' of ' + results.length + ' cases passed.');
if (failed > 0) process.exit(1);
