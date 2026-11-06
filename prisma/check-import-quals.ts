import { readQualificationEntries, type BranchRow } from '../lib/import/qualification-entries';

const results: [string, boolean][] = [];
const check = (n: string, ok: boolean) => { results.push([n, ok]); };

const D = 'q-dip', B = 'q-btech';
const rows: BranchRow[] = [
  { id: 'd-civil', name: 'Civil Engineering (Diploma)', slug: 'civil-engineering-diploma', qualificationId: D },
  { id: 'b-mech', name: 'Mechanical Engineering', slug: 'mechanical-engineering', qualificationId: B },
  { id: 'b-civil', name: 'Civil Engineering', slug: 'civil-engineering', qualificationId: B },
];
const quals: Record<string, string> = { diploma: D, 'b.tech / b.e': B };
const resolve = (t: string) => quals[t.toLowerCase()];
const run = (input: object) => readQualificationEntries(input, resolve, rows);
const has = (r: { errors: string[] }, part: string) => r.errors.filter((e) => e.includes(part)).length > 0;

const legacy = run({ qualifications: ['Diploma', 'B.Tech / B.E'], branches: ['Civil Engineering'] });
check('plain names: both qualifications', legacy.qualificationIds.length === 2);
check('plain names: one flat branch list, no rules', legacy.branchIds.join() === 'b-civil' && legacy.qualificationRules.length === 0 && legacy.errors.length === 0);

const per = run({ qualifications: [{ name: 'Diploma', branches: ['Civil'] }, { name: 'B.Tech / B.E', branches: ['Mechanical'] }] });
check('per qualification: Diploma gets Civil', per.qualificationRules[0].qualificationId === D && per.qualificationRules[0].branchIds.join() === 'd-civil');
check('per qualification: B.Tech gets Mechanical only', per.qualificationRules[1].branchIds.join() === 'b-mech');
check('per qualification: union of branches', per.branchIds.length === 2 && per.errors.length === 0);

check('no branches means any branch', run({ qualifications: [{ name: 'Diploma' }] }).qualificationRules[0].branchIds.length === 0);
check('a branch of another qualification is refused', has(run({ qualifications: [{ name: 'Diploma', branches: ['Mechanical Engineering'] }] }), 'different qualification'));
check('an unknown branch is reported', has(run({ qualifications: [{ name: 'B.Tech / B.E', branches: ['Basket Weaving'] }] }), 'branch not found'));
check('an unknown qualification is reported', has(run({ qualifications: ['Nope'] }), 'qualification not found'));
check('no qualification is reported', has(run({}), 'needs a qualification'));

const mixed = run({ qualifications: ['Diploma', { name: 'B.Tech / B.E', branches: ['Mechanical'] }], branches: ['Civil'] });
check('a plain name beside objects takes the flat branches', mixed.qualificationRules[0].branchIds.join() === 'd-civil' && mixed.qualificationRules[1].branchIds.join() === 'b-mech');

const dup = run({ qualifications: [{ name: 'Diploma', branches: ['Civil'] }, { name: 'Diploma' }] });
check('a repeated qualification merges, and any branch wins', dup.qualificationRules.length === 1 && dup.qualificationRules[0].branchIds.length === 0);
check('the single qualification field still works', run({ qualification: 'Diploma' }).qualificationIds.join() === D);

const nb = run({ qualifications: [{ name: 'B.Tech / B.E', branches: ['NEW: Marine Engineering'] }] });
check('NEW: queues a branch to create', nb.newBranches.length === 1 && nb.newBranches[0].name === 'Marine Engineering' && nb.errors.length === 0);
check('NEW: never counts as an error or a found branch', nb.branchIds.length === 0);
check('NEW: for an existing branch reuses it', (() => { const r = run({ qualifications: [{ name: 'B.Tech / B.E', branches: ['NEW: Mechanical'] }] }); return r.newBranches.length === 0 && r.qualificationRules[0].branchIds.join() === 'b-mech'; })());
check('NEW: for a name used under another qualification is refused', has(run({ qualifications: [{ name: 'Diploma', branches: ['NEW: Mechanical Engineering'] }] }), 'another qualification'));
check('NEW: with no name is an error', has(run({ qualifications: [{ name: 'Diploma', branches: ['NEW:'] }] }), 'needs a branch name'));
check('the same NEW: branch twice is queued once', run({ qualifications: [{ name: 'Diploma', branches: ['NEW: Marine', 'new: marine'] }] }).newBranches.length === 1);

let failed = 0;
for (const [n, ok] of results) { if (!ok) failed++; console.log((ok ? 'PASS' : 'FAIL') + '  ' + n); }
console.log('\n' + (results.length - failed) + ' of ' + results.length + ' cases passed.');
if (failed > 0) process.exit(1);
