import { evaluateMarks, marksCutoff } from '../lib/skill-rules';

const post = { minMarksPercent: 50, minMarksByCategory: { OBC: 47, OBC_NCL: 45 } };
const results: [string, boolean][] = [];
const check = (n: string, ok: boolean) => { results.push([n, ok]); };

check('non-creamy OBC uses the NCL figure', marksCutoff(post, 'OBC', 'NON_CREAMY') === 45);
check('creamy OBC uses the OBC figure', marksCutoff(post, 'OBC', 'CREAMY') === 47);
check('OBC with no layer uses the OBC figure', marksCutoff(post, 'OBC', null) === 47);
check('a General user is unaffected', marksCutoff(post, 'General', null) === 50);
check('46% passes for non-creamy and fails for creamy', evaluateMarks(post, 'OBC', 46, 'NON_CREAMY').status === 'yes' && evaluateMarks(post, 'OBC', 46, 'CREAMY').status === 'no');
check('no NCL figure falls back to OBC', marksCutoff({ minMarksPercent: 50, minMarksByCategory: { OBC: 47 } }, 'OBC', 'NON_CREAMY') === 47);

let failed = 0;
for (const [n, ok] of results) { if (!ok) failed++; console.log((ok ? 'PASS' : 'FAIL') + '  ' + n); }
console.log('\n' + (results.length - failed) + ' of ' + results.length + ' cases passed.');
if (failed > 0) process.exit(1);
