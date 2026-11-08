import { evaluateAge } from '../lib/age-rules';

const now = new Date('2026-11-08T00:00:00Z');
const user = (dob: string) => ({ dateOfBirth: new Date(dob), category: null as string | null });
const results: [string, boolean][] = [];
const check = (n: string, ok: boolean) => { results.push([n, ok]); };

check('27y 3m passes a 27.5 limit', evaluateAge(user('1999-08-08'), { minAge: 18, maxAge: 27.5 }, now).status === 'yes');
check('27y 8m fails a 27.5 limit', evaluateAge(user('1999-03-08'), { minAge: 18, maxAge: 27.5 }, now).status !== 'yes');
check('27y 8m still passes a whole limit of 27', evaluateAge(user('1999-03-08'), { minAge: 18, maxAge: 27 }, now).status === 'yes');
check('18y 3m is below a 18.5 minimum', evaluateAge(user('2008-08-08'), { minAge: 18.5, maxAge: 30 }, now).status === 'no');

let failed = 0;
for (const [n, ok] of results) { if (!ok) failed++; console.log((ok ? 'PASS' : 'FAIL') + '  ' + n); }
console.log('\n' + (results.length - failed) + ' of ' + results.length + ' cases passed.');
if (failed > 0) process.exit(1);
