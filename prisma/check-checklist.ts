import { buildChecklist } from '../lib/doc-checklist';
const results: [string, boolean][] = [];
const check = (n: string, ok: boolean) => { results.push([n, ok]); };
const ids = (posts: any[]) => buildChecklist(posts).map((i) => i.id);
check('a plain post gets the standard items only', ids([{}]).length === 8 && !ids([{}]).includes('pwd'));
check('disability groups add the certificate', ids([{ pwdTypes: ['VISUAL'] }]).includes('pwd'));
check('reserved PwD vacancies add it too', ids([{ pwdVacancies: { HEARING: 1 } }]).includes('pwd'));
check('experience and driving add one item', ids([{ minExperienceYears: 2 }, { minDrivingYears: 3 }]).filter((i) => i === 'exp').length === 1);
check('required certificates are listed once', ids([{ requiredCertifications: ['CTET'] }, { requiredCertifications: ['CTET'] }]).filter((i) => i === 'cert-CTET').length === 1);
check('typing or shorthand adds the skill item', ids([{ shorthandWpm: 110 }]).includes('skill'));
let failed = 0;
for (const [n, ok] of results) { if (!ok) failed++; console.log((ok ? 'PASS' : 'FAIL') + '  ' + n); }
console.log('\n' + (results.length - failed) + ' of ' + results.length + ' cases passed.');
if (failed > 0) process.exit(1);
