import 'dotenv/config';
import { prisma } from '../lib/prisma';
import { evaluatePost, type EducationFact, type FitContext } from '../lib/job-fit';
import { fieldKey } from '../lib/field-keys';

async function main() {
  const rows = await prisma.qualification.findMany({ select: { id: true, name: true, level: true, categories: { select: { slug: true, name: true } } } });
  const q = (name: string) => { const f = rows.find((r) => r.name === name); if (!f) throw new Error(`Missing qualification ${name}`); return f; };
  const edu = (name: string, field?: string): EducationFact => ({ qualification: q(name), field: fieldKey(field), fieldLabel: field ?? null });

  const ctx = (educations: EducationFact[]): FitContext => ({
    hasProfile: true, profileComplete: true, strength: 100, missing: [],
    qualifications: new Map(rows.map((r) => [r.id, r])),
    user: {
      educations, dateOfBirth: new Date(Date.now() - 25 * 365.25 * 86_400_000), category: 'General',
      disabilityTypes: [], disabilityPercent: null, specialStatuses: [], gender: 'Male', domicileStateCode: null,
      experienceYears: null, certifications: [], heightCm: null, chestCm: null, preferredRoleIds: [], preferredEmploymentTypes: [],
    },
  });

  const branches = [{ id: 'b-civil', name: 'Civil' }, { id: 'b-mech', name: 'Mechanical' }];
  const base = { title: 'T', minAge: 18, maxAge: 40, employmentType: 'PERMANENT' };
  const dip = q('Diploma (Engineering)').id;
  const btech = q('B.Tech / B.E').id;

  const split: any = {
    ...base, qualifications: [{ id: dip }, { id: btech }], branches,
    qualificationRules: [{ qualificationId: dip, branchIds: ['b-civil'] }, { qualificationId: btech, branchIds: ['b-mech'] }],
  };
  const legacy: any = { ...base, qualifications: [{ id: dip }, { id: btech }], branches };
  const anyField: any = {
    ...base, qualifications: [{ id: dip }, { id: btech }], branches,
    qualificationRules: [{ qualificationId: dip, branchIds: [] }, { qualificationId: btech, branchIds: ['b-mech'] }],
  };

  const cases: [string, FitContext, any, string][] = [
    ['Diploma Civil meets "Diploma Civil or B.Tech Mechanical"', ctx([edu('Diploma (Engineering)', 'Civil')]), split, 'eligible'],
    ['B.Tech Mechanical meets it', ctx([edu('B.Tech / B.E', 'Mechanical')]), split, 'eligible'],
    ['B.Tech Civil does not', ctx([edu('B.Tech / B.E', 'Civil')]), split, 'not-eligible'],
    ['Diploma Mechanical does not', ctx([edu('Diploma (Engineering)', 'Mechanical')]), split, 'not-eligible'],
    ['M.Tech Mechanical counts via B.Tech Mechanical', ctx([edu('M.Tech / M.E', 'Mechanical')]), split, 'eligible'],
    ['Diploma with no branch given is "unknown"', ctx([edu('Diploma (Engineering)')]), split, 'unknown'],
    ['a post with no rules still works the old way: B.Tech Civil passes', ctx([edu('B.Tech / B.E', 'Civil')]), legacy, 'eligible'],
    ['Diploma open to any branch: Diploma Mechanical passes', ctx([edu('Diploma (Engineering)', 'Mechanical')]), anyField, 'eligible'],
    ['same post: B.Tech Civil still fails', ctx([edu('B.Tech / B.E', 'Civil')]), anyField, 'not-eligible'],
  ];

  let failed = 0;
  for (const [name, c, post, expected] of cases) {
    const r = evaluatePost(c, post);
    const ok = r.verdict === expected;
    if (!ok) failed++;
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : `  -> got ${r.verdict}: ${r.checks.map((x) => x.text).join(' | ')}`}`);
  }
  const msg = evaluatePost(ctx([edu('B.Tech / B.E', 'Civil')]), split).checks.find((c) => c.label === 'Qualification')?.text ?? '';
  const nice = msg.includes('Diploma (Engineering) (Civil)') && msg.includes('B.Tech / B.E (Mechanical)');
  if (!nice) failed++;
  console.log(`${nice ? 'PASS' : 'FAIL'}  the message names each qualification with its own branch${nice ? '' : `  -> ${msg}`}`);
  console.log(`\n${cases.length + 1 - failed} of ${cases.length + 1} cases passed.`);
  if (failed > 0) process.exit(1);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
