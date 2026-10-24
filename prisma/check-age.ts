import { evaluateAge, type AgePost, type AgeUser } from '../lib/age-rules';

const dobFor = (age: number) => {
  const d = new Date();
  d.setDate(15);
  d.setMonth(d.getMonth() - 1);
  d.setFullYear(d.getFullYear() - age);
  return d;
};

const user = (age: number, extra: Partial<AgeUser> = {}): AgeUser => ({
  dateOfBirth: dobFor(age),
  category: 'General',
  disabilityTypes: [],
  disabilityPercent: null,
  specialStatuses: [],
  ...extra,
});
const post = (maxAge: number | null, rules: unknown = null, extra: Partial<AgePost> = {}): AgePost => ({
  minAge: 18,
  maxAge,
  relaxationRules: rules,
  ...extra,
});
const rule = (category: string, status: string, years: number | null, maxAge: number | null = null) => ({
  category,
  status,
  years,
  maxAge,
  note: null,
});

const PWD = { disabilityTypes: ['LOCOMOTOR'], disabilityPercent: 45 };

const cases: [string, AgeUser, AgePost, 'yes' | 'no' | 'unknown'][] = [
  ['no age limits at all', user(60), { minAge: null, maxAge: null }, 'yes'],
  ['limits but no birth date', { ...user(30), dateOfBirth: null }, post(27), 'unknown'],
  ['inside the limit', user(25), post(27), 'yes'],
  ['below the minimum age', user(17), post(27), 'no'],
  ['OBC +3 years', user(30, { category: 'OBC' }), post(27, [rule('OBC', 'NONE', 3)]), 'yes'],
  ['General, only an OBC rule', user(30), post(27, [rule('OBC', 'NONE', 3)]), 'no'],
  ['OBC user, only an SC rule', user(30, { category: 'OBC' }), post(27, [rule('SC', 'NONE', 5)]), 'no'],
  ['PwD +10, user PwD 45%', user(36, PWD), post(27, [rule('GENERAL', 'PWD', 10)]), 'yes'],
  ['PwD +10, user disability 30% (under benchmark)', user(36, { ...PWD, disabilityPercent: 30 }), post(27, [rule('GENERAL', 'PWD', 10)]), 'no'],
  ['PwD rule open to visual only, user locomotor', user(36, PWD), post(27, [rule('ANY', 'PWD', 10)], { pwdTypes: ['VISUAL'] }), 'no'],
  ['PwD rule open to locomotor, user locomotor', user(36, PWD), post(27, [rule('ANY', 'PWD', 10)], { pwdTypes: ['LOCOMOTOR'] }), 'yes'],
  ['OBC + PwD row gives 13 years', user(39, { category: 'OBC', disabilityTypes: ['HEARING'], disabilityPercent: 60 }), post(27, [rule('OBC', 'NONE', 3), rule('OBC', 'PWD', 13)]), 'yes'],
  ['OBC only, with an OBC + PwD row present', user(31, { category: 'OBC' }), post(27, [rule('OBC', 'NONE', 3), rule('OBC', 'PWD', 13)]), 'no'],
  ['ex-serviceman, absolute max age 50', user(48, { specialStatuses: ['EX_SERVICEMAN'] }), post(27, [rule('ANY', 'EX_SERVICEMAN', null, 50)]), 'yes'],
  ['widow, max age 35', user(34, { specialStatuses: ['WIDOW'] }), post(27, [rule('ANY', 'WIDOW', null, 35)]), 'yes'],
  ['same job, user is not a widow', user(34), post(27, [rule('ANY', 'WIDOW', null, 35)]), 'no'],
  ['older free-form map, OBC +3', user(30, { category: 'OBC' }), post(27, null, { ageRelaxation: { OBC: '3 years' } }), 'yes'],
  ['older free-form map, SC/ST only, user OBC', user(30, { category: 'OBC' }), post(27, null, { ageRelaxation: { 'SC/ST': '5 years' } }), 'no'],
];

let failed = 0;
for (const [name, u, p, expected] of cases) {
  const result = evaluateAge(u, p);
  const ok = result.status === expected;
  if (!ok) failed++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : `  -> got ${result.status}, expected ${expected}`}`);
  if (!ok) for (const check of result.checks) console.log(`        ${check.text}`);
}
console.log(`\n${cases.length - failed} of ${cases.length} cases passed.`);
if (failed > 0) process.exit(1);
