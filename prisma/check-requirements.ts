import { evaluateRequirements, type ReqPost, type ReqUser } from '../lib/requirements';

const user = (extra: Partial<ReqUser> = {}): ReqUser => ({
  gender: 'Male', domicileStateCode: 'BR', experienceYears: null, certifications: [], heightCm: 172, chestCm: 82, ...extra,
});

const cases: [string, ReqUser, ReqPost, 'yes' | 'no' | 'unknown'][] = [
  ['no extra requirements', user(), {}, 'yes'],
  ['men only, male', user(), { genderRestriction: 'MALE' }, 'yes'],
  ['men only, female', user({ gender: 'Female' }), { genderRestriction: 'MALE' }, 'no'],
  ['women only, gender not given', user({ gender: null }), { genderRestriction: 'FEMALE' }, 'unknown'],
  ['men only, gender Other', user({ gender: 'Other' }), { genderRestriction: 'MALE' }, 'unknown'],
  ['domicile Bihar, user Bihar', user(), { domicileStateCode: 'BR' }, 'yes'],
  ['domicile Bihar, user UP', user({ domicileStateCode: 'UP' }), { domicileStateCode: 'BR' }, 'no'],
  ['domicile Bihar, home state not given', user({ domicileStateCode: null }), { domicileStateCode: 'BR' }, 'unknown'],
  ['2 years needed, has 3', user({ experienceYears: 3 }), { minExperienceYears: 2 }, 'yes'],
  ['2 years needed, has 1', user({ experienceYears: 1 }), { minExperienceYears: 2 }, 'no'],
  ['2 years needed, not given', user(), { minExperienceYears: 2 }, 'unknown'],
  ['CTET needed, has it', user({ certifications: ['CTET'] }), { requiredCertifications: ['CTET'] }, 'yes'],
  ['CTET needed, none', user(), { requiredCertifications: ['CTET'] }, 'no'],
  ['CTET and typing needed, has only CTET', user({ certifications: ['CTET'] }), { requiredCertifications: ['CTET', 'TYPING_EN'] }, 'no'],
  ['height 170, user 172', user(), { minHeightCm: 170 }, 'yes'],
  ['height 170, user 165', user({ heightCm: 165 }), { minHeightCm: 170 }, 'no'],
  ['height 170, not given', user({ heightCm: null }), { minHeightCm: 170 }, 'unknown'],
  ['chest 81, user 82', user(), { minChestCm: 81 }, 'yes'],
  ['chest 85, user 82', user(), { minChestCm: 85 }, 'no'],
  ['chest 85, female user is skipped', user({ gender: 'Female', chestCm: null }), { minChestCm: 85 }, 'yes'],
  ['a failure beats an unknown', user({ gender: null }), { genderRestriction: 'MALE', requiredCertifications: ['NET'] }, 'no'],
];

let failed = 0;
for (const [name, u, p, expected] of cases) {
  const result = evaluateRequirements(u, p);
  const ok = result.status === expected;
  if (!ok) failed++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : `  -> got ${result.status}, expected ${expected}`}`);
}
console.log(`\n${cases.length - failed} of ${cases.length} cases passed.`);
if (failed > 0) process.exit(1);
