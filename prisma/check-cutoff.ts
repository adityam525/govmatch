import { evaluatePost } from '../lib/job-fit';

const ctx: any = {
  hasProfile: true, profileComplete: true, strength: 100, missing: [], qualifications: new Map(),
  user: {
    educations: [], dateOfBirth: new Date('1996-06-15T00:00:00.000Z'), category: 'General',
    disabilityTypes: [], disabilityPercent: null, specialStatuses: [], gender: 'Male',
    domicileStateCode: null, experienceYears: null, certifications: [], heightCm: null, chestCm: null,
    preferredRoleIds: [], preferredEmploymentTypes: [],
  },
};
const post = (cutoff: string | null) => ({ title: 'T', minAge: 18, maxAge: 28, ageCutoffDate: cutoff ? new Date(`${cutoff}T00:00:00.000Z`) : null, employmentType: 'PERMANENT' });

const cases: [string, string | null, string][] = [
  ['age 28 on 1 Jan 2025 fits a limit of 28', '2025-01-01', 'eligible'],
  ['age 29 on 1 Jan 2026 is over a limit of 28', '2026-01-01', 'not-eligible'],
  ['age 28 on the day before the birthday', '2025-06-14', 'eligible'],
  ['age 29 on the birthday itself, over a limit of 28', '2025-06-15', 'not-eligible'],
  ['age 30 on the next birthday', '2026-06-15', 'not-eligible'],
];

let failed = 0;
for (const [name, cutoff, expected] of cases) {
  const r = evaluatePost(ctx, post(cutoff) as any);
  const ok = r.verdict === expected;
  if (!ok) failed++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : `  -> got ${r.verdict}: ${r.checks.map((c) => c.text).join(' | ')}`}`);
}
const withText = evaluatePost(ctx, post('2025-01-01') as any).checks.find((c) => c.label === 'Age')?.text ?? '';
const textOk = withText.includes('age as on 01 Jan 2025');
if (!textOk) failed++;
console.log(`${textOk ? 'PASS' : 'FAIL'}  tooltip names the cut-off date${textOk ? '' : `  -> ${withText}`}`);
console.log(`\n${cases.length + 1 - failed} of ${cases.length + 1} cases passed.`);
if (failed > 0) process.exit(1);
