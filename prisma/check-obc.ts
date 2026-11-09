import { evaluateAge } from '../lib/age-rules';

const now = new Date('2026-11-08T00:00:00Z');
const post = { minAge: 18, maxAge: 30, relaxationRules: [{ category: 'OBC_NCL', status: 'NONE', years: 3, maxAge: null, note: null }] };
const user = (category: string, obcLayer: string | null) => ({ dateOfBirth: new Date('1994-06-01'), category, obcLayer });
const results: [string, boolean][] = [];
const check = (n: string, ok: boolean) => { results.push([n, ok]); };

check('non-creamy OBC gets the relaxation', evaluateAge(user('OBC', 'NON_CREAMY'), post, now).status === 'yes');
check('creamy OBC does not', evaluateAge(user('OBC', 'CREAMY'), post, now).status === 'no');
check('OBC with no layer is told to add it', evaluateAge(user('OBC', null), post, now).checks[0].text.includes('add it to your profile'));
check('a General user does not get it', evaluateAge(user('General', null), post, now).status === 'no');
check('a plain OBC rule still covers every OBC user', evaluateAge(user('OBC', 'CREAMY'), { ...post, relaxationRules: [{ category: 'OBC', status: 'NONE', years: 3, maxAge: null, note: null }] }, now).status === 'yes');

let failed = 0;
for (const [n, ok] of results) { if (!ok) failed++; console.log((ok ? 'PASS' : 'FAIL') + '  ' + n); }
console.log('\n' + (results.length - failed) + ' of ' + results.length + ' cases passed.');
if (failed > 0) process.exit(1);
