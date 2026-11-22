import { coerceDefinition } from '../lib/qb/template-input';
import { validateAny } from '../lib/qb/validate-any';
import { isFixed } from '../lib/qb/fixed';

const good = { text: 'Choose the word closest in meaning to "rapid".', options: ['Slow', 'Quick', 'Late', 'Heavy'], correctIndex: 1, explanation: '"Rapid" means fast, as "quick" does.' };
const results: [string, boolean][] = [];
const check = (n: string, ok: boolean) => { results.push([n, ok]); };
const parsed: any = coerceDefinition({ fixed: good });
check('a fixed definition is kept as fixed', !('error' in parsed) && isFixed(parsed.def));
check('a good fixed question validates', validateAny(parsed.def).ok === true);
check('a bad fixed question reports errors', (() => { const p: any = coerceDefinition({ fixed: { ...good, options: ['a', 'a', 'b', 'c'] } }); return validateAny(p.def).ok === false && validateAny(p.def).errors.length > 0; })());
check('a formula definition still goes the old way', (() => { const p: any = coerceDefinition({ text: 'x {a}', variables: [{ name: 'a', kind: 'int', min: 1, max: 3 }], derived: [], constraints: [], answer: { expr: 'a', decimals: 0 }, distractors: ['a+1', 'a+2', 'a+3'], explanation: 'e' }); return !isFixed(p.def); })());
let failed = 0;
for (const [n, ok] of results) { if (!ok) failed++; console.log((ok ? 'PASS' : 'FAIL') + '  ' + n); }
console.log('\n' + (results.length - failed) + ' of ' + results.length + ' cases passed.');
if (failed > 0) process.exit(1);
