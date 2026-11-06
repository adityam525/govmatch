import { readPostRules } from '../lib/import/post-rules';

const results: [string, boolean][] = [];
const check = (n: string, ok: boolean) => { results.push([n, ok]); };
const has = (p: object, part: string) => readPostRules(p).errors.filter((e) => e.includes(part)).length > 0;

const none = readPostRules({});
check('a post with no extra rules is clean', none.errors.length === 0 && none.rules.genderRestriction === null && none.rules.typingOptions.length === 0);
const full = readPostRules({
  genderRestriction: 'female', minExperienceYears: 2, minHeightCm: 160, minChestCm: 80, requiredCertifications: ['CTET', 'typing_en'],
  pwdTypes: ['LOCOMOTOR'], domicileStateCode: 'br', ageCutoffDate: '2026-08-01', minMarksPercent: 50,
  minMarksByCategory: { OBC: 45, SC: 40 }, typingOptions: [{ lang: 'EN', wpm: 30 }, { lang: 'HI', wpm: 25 }],
  relaxationRules: [{ category: 'OBC', status: 'NONE', years: 3 }],
});
check('a full post is accepted', full.errors.length === 0);
check('values are normalised', full.rules.genderRestriction === 'FEMALE' && full.rules.domicileStateCode === 'BR' && full.rules.requiredCertifications.join() === 'CTET,TYPING_EN');
check('numbers and the date come through', full.rules.minExperienceYears === 2 && full.rules.minMarksPercent === 50 && full.rules.ageCutoffDate?.toISOString().slice(0, 10) === '2026-08-01');
check('category marks and typing come through', full.rules.minMarksByCategory.OBC === 45 && full.rules.typingOptions.length === 2);
check('relaxation rules are kept with the older map', full.rules.relaxationRules.length === 1 && Object.keys(full.rules.ageRelaxation).length === 1);
check('a bad gender is refused', has({ genderRestriction: 'Women' }, 'genderRestriction'));
check('an unknown certificate is refused', has({ requiredCertifications: ['PHD'] }, 'unknown code'));
check('an unknown disability group is refused', has({ pwdTypes: ['XYZ'] }, 'unknown group'));
check('a state name instead of a code is refused', has({ domicileStateCode: 'Bihar' }, 'two-letter'));
check('a fake date is refused', has({ ageCutoffDate: '2026-02-31' }, 'real date'));
check('marks above 100 are refused', has({ minMarksPercent: 120 }, 'minMarksPercent'));
check('a bad category cut-off is refused, not dropped', has({ minMarksByCategory: { OBC: 150 } }, 'minMarksByCategory'));
check('a bad typing entry is refused, not dropped', has({ typingOptions: [{ lang: 'FR', wpm: 30 }] }, 'typingOptions'));
check('height out of range is refused', has({ minHeightCm: 40 }, 'minHeightCm'));
check('empty strings mean "not set"', readPostRules({ genderRestriction: '', minExperienceYears: '', minMarksPercent: '', ageCutoffDate: '' }).errors.length === 0);

let failed = 0;
for (const [n, ok] of results) { if (!ok) failed++; console.log((ok ? 'PASS' : 'FAIL') + '  ' + n); }
console.log('\n' + (results.length - failed) + ' of ' + results.length + ' cases passed.');
if (failed > 0) process.exit(1);
