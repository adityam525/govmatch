import { jobMatchesPreferences, type PreferenceSets } from '../lib/preferences';
import { computeCompleteness } from '../lib/profile-completeness';

const prefs = (o: Partial<Record<keyof PreferenceSets, string[]>>): PreferenceSets => ({
  states: new Set(o.states ?? []), sectors: new Set(o.sectors ?? []), organizations: new Set(o.organizations ?? []),
});
const job = { organizationSlug: 'ssc', sectorSlug: 'central', stateCodes: ['BR'] };
const base = { dateOfBirth: new Date(), educationCount: 1, category: 'General', gender: 'Male', phoneNumber: '1', preferenceCount: 1 };

const cases: [string, boolean][] = [
  ['no preferences: no boost', jobMatchesPreferences(job, prefs({})) === false],
  ['preferred organization matches', jobMatchesPreferences(job, prefs({ organizations: ['ssc'] })) === true],
  ['preferred sector matches', jobMatchesPreferences(job, prefs({ sectors: ['central'] })) === true],
  ['preferred state matches', jobMatchesPreferences(job, prefs({ states: ['BR'] })) === true],
  ['a different organization does not', jobMatchesPreferences(job, prefs({ organizations: ['rrb'] })) === false],
  ['job with no state info is safe', jobMatchesPreferences({ organizationSlug: 'x' }, prefs({ states: ['BR'] })) === false],
  ['complete profile with places is 100%', computeCompleteness({ ...base, sectorPrefCount: 2 }).percent === 100],
  ['same profile without places is 86%', computeCompleteness({ ...base, sectorPrefCount: 0 }).percent === 86],
  ['places are optional, not required', computeCompleteness({ ...base, sectorPrefCount: 0 }).requiredMissing.length === 0],
];
let failed = 0;
for (const [name, ok] of cases) { if (!ok) failed++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); }
console.log(`\n${cases.length - failed} of ${cases.length} cases passed.`);
if (failed > 0) process.exit(1);
