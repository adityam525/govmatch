import 'dotenv/config';
import { prisma } from '../lib/prisma';
import { evaluatePost, type EducationFact, type FitContext, type FitVerdict, type PostLike } from '../lib/job-fit';
import { fieldKey } from '../lib/field-keys';

async function main() {
  const rows = await prisma.qualification.findMany({
    select: { id: true, name: true, level: true, categories: { select: { slug: true, name: true } } },
  });
  const byName = new Map(rows.map((q) => [q.name, q]));
  const q = (name: string) => {
    const found = byName.get(name);
    if (!found) throw new Error(`Qualification not found: ${name}`);
    return found;
  };

  const edu = (name: string, field?: string): EducationFact => ({
    qualification: q(name),
    field: fieldKey(field),
    fieldLabel: field ?? null,
  });

  const post = (accepted: string[], opts: { branches?: string[]; maxAge?: number; relaxation?: unknown } = {}): PostLike => ({
    title: 'Test post',
    qualifications: accepted.map((name) => ({ id: q(name).id })),
    branches: (opts.branches ?? []).map((name) => ({ name })),
    minAge: 18,
    maxAge: opts.maxAge ?? 40,
    ageRelaxation: opts.relaxation ?? null,
    employmentType: 'PERMANENT',
    roles: [],
  });

  const context = (educations: EducationFact[], extra: { age?: number; category?: string; prefs?: string[] } = {}): FitContext => {
    const dob = new Date();
    dob.setFullYear(dob.getFullYear() - (extra.age ?? 25));
    return {
      hasProfile: true,
      profileComplete: educations.length > 0,
      strength: 100,
      missing: [],
      qualifications: new Map(rows.map((r) => [r.id, r])),
      user: {
        educations,
        dateOfBirth: dob,
        category: extra.category ?? null,
        disabilityTypes: [],
        disabilityPercent: null,
        specialStatuses: [],
        preferredRoleIds: [],
        preferredEmploymentTypes: extra.prefs ?? [],
      },
    };
  };

  const CS = ['Computer Science'];
  const cases: [string, FitContext, PostLike, FitVerdict][] = [
    ['10th job, user 12th', context([edu('12th Pass')]), post(['10th Pass']), 'eligible'],
    ['10th job, user 8th only', context([edu('8th Pass')]), post(['10th Pass']), 'not-eligible'],
    ['10th job, Diploma holder', context([edu('Diploma (Engineering)', 'Civil')]), post(['10th Pass']), 'eligible'],
    ['12th job, ITI only', context([edu('ITI')]), post(['12th Pass']), 'not-eligible'],
    ['12th job, Diploma only', context([edu('Diploma (Engineering)', 'Civil')]), post(['12th Pass']), 'not-eligible'],
    ['12th job, ITI + 12th', context([edu('ITI'), edu('12th Pass')]), post(['12th Pass']), 'eligible'],
    ['12th job, B.Com', context([edu('B.Com')]), post(['12th Pass']), 'eligible'],
    ['Any Graduate job, B.Com', context([edu('B.Com')]), post(['Any Graduate']), 'eligible'],
    ['Any Graduate job, M.A', context([edu('M.A', 'History')]), post(['Any Graduate']), 'eligible'],
    ['Any Graduate job, 12th only', context([edu('12th Pass')]), post(['Any Graduate']), 'not-eligible'],
    ['Any Graduate job, Diploma only', context([edu('Diploma (Engineering)', 'Civil')]), post(['Any Graduate']), 'not-eligible'],
    ['Any PG job, B.Tech only', context([edu('B.Tech / B.E', 'Computer Science')]), post(['Any Post Graduate']), 'not-eligible'],
    ['B.Tech CS job, B.Tech CS', context([edu('B.Tech / B.E', 'Computer Science')]), post(['B.Tech / B.E'], { branches: CS }), 'eligible'],
    ['B.Tech CS job, B.Tech Computer Science and Engineering', context([edu('B.Tech / B.E', 'Computer Science and Engineering')]), post(['B.Tech / B.E'], { branches: CS }), 'eligible'],
    ['B.Tech CS job, B.Tech CSE', context([edu('B.Tech / B.E', 'CSE')]), post(['B.Tech / B.E'], { branches: CS }), 'eligible'],
    ['B.Tech CS job, B.Tech Mechanical', context([edu('B.Tech / B.E', 'Mechanical')]), post(['B.Tech / B.E'], { branches: CS }), 'not-eligible'],
    ['B.Tech CS job, M.Tech CS', context([edu('M.Tech / M.E', 'Computer Science')]), post(['B.Tech / B.E'], { branches: CS }), 'eligible'],
    ['B.Tech CS job, M.Tech Mechanical', context([edu('M.Tech / M.E', 'Mechanical')]), post(['B.Tech / B.E'], { branches: CS }), 'not-eligible'],
    ['B.Tech CS job, M.Sc Physics', context([edu('M.Sc', 'Physics')]), post(['B.Tech / B.E'], { branches: CS }), 'not-eligible'],
    ['B.Tech CS job, MBA', context([edu('MBA', 'Finance')]), post(['B.Tech / B.E'], { branches: CS }), 'not-eligible'],
    ['B.Tech CS job, B.Tech with no branch given', context([edu('B.Tech / B.E')]), post(['B.Tech / B.E'], { branches: CS }), 'unknown'],
    ['B.Tech any-branch job, M.Tech any', context([edu('M.Tech / M.E')]), post(['B.Tech / B.E']), 'eligible'],
    ['Diploma Civil job, B.Tech Civil', context([edu('B.Tech / B.E', 'Civil')]), post(['Diploma (Engineering)'], { branches: ['Civil'] }), 'eligible'],
    ['Diploma Civil job, Diploma Civil', context([edu('Diploma (Engineering)', 'Civil')]), post(['Diploma (Engineering)'], { branches: ['Civil'] }), 'eligible'],
    ['Diploma Civil job, 12th only', context([edu('12th Pass')]), post(['Diploma (Engineering)'], { branches: ['Civil'] }), 'not-eligible'],
    ['M.A Economics job, M.A History + M.A Economics', context([edu('M.A', 'History'), edu('M.A', 'Economics')]), post(['M.A'], { branches: ['Economics'] }), 'eligible'],
    ['M.A Economics job, M.A History only', context([edu('M.A', 'History')]), post(['M.A'], { branches: ['Economics'] }), 'not-eligible'],
    ['Age 30, max 27, OBC with "3 years" relaxation', context([edu('12th Pass')], { age: 30, category: 'OBC' }), post(['10th Pass'], { maxAge: 27, relaxation: { OBC: '3 years' } }), 'eligible'],
    ['Age 30, max 27, General', context([edu('12th Pass')], { age: 30, category: 'General' }), post(['10th Pass'], { maxAge: 27, relaxation: { OBC: '3 years' } }), 'not-eligible'],
    ['Age 30, max 27, OBC but only SC/ST relaxation listed', context([edu('12th Pass')], { age: 30, category: 'OBC' }), post(['10th Pass'], { maxAge: 27, relaxation: { 'SC/ST': '5 years' } }), 'not-eligible'],
    ['Only contract jobs preferred, permanent job', context([edu('12th Pass')], { prefs: ['CONTRACT'] }), post(['10th Pass']), 'not-eligible'],
    ['No education on file', context([]), post(['10th Pass']), 'unknown'],
    ['Post lists no qualification', context([edu('10th Pass')]), post([]), 'eligible'],
  ];

  let failed = 0;
  for (const [name, ctx, p, expected] of cases) {
    const result = evaluatePost(ctx, p);
    const ok = result.verdict === expected;
    if (!ok) failed++;
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : `  -> got ${result.verdict} (${result.label}), expected ${expected}`}`);
    if (!ok) for (const check of result.checks) console.log(`        [${check.state}] ${check.label}: ${check.text}`);
  }

  const sample = evaluatePost(
    context([edu('B.Tech / B.E', 'Computer Science')]),
    { ...post(['B.Tech / B.E'], { branches: ['Civil', 'Computer Science'] }), roles: [{ id: 'x' }] },
  );
  console.log('\nSample explanation:', JSON.stringify(sample, null, 2));

  console.log(`\n${cases.length - failed} of ${cases.length} cases passed.`);
  if (failed > 0) process.exit(1);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
