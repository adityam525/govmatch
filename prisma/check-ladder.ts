import 'dotenv/config';
import { prisma } from '../lib/prisma';
import { evaluatePost, type FitContext } from '../lib/job-fit';

async function main() {
  const rows = await prisma.qualification.findMany({
    select: { id: true, name: true, level: true, categories: { select: { slug: true, name: true } } },
    orderBy: [{ level: 'asc' }, { name: 'asc' }],
  });
  const vocational = (q: (typeof rows)[number]) =>
    /\b(iti|apprentice|diploma)\b/i.test(q.name) || q.categories.some((c) => /\b(iti|apprentice|diploma)\b/i.test(c.name));

  const required = ['8th Pass', '10th Pass', '12th Pass', 'Any Graduate', 'Any Post Graduate']
    .map((name) => rows.find((r) => r.name === name))
    .filter((r): r is (typeof rows)[number] => !!r);

  const dob = new Date(Date.now() - 25 * 365.25 * 86_400_000);
  const ctxFor = (q: (typeof rows)[number]): FitContext => ({
    hasProfile: true, profileComplete: true, strength: 100, missing: [],
    qualifications: new Map(rows.map((r) => [r.id, r])),
    user: {
      educations: [{ qualification: q, field: null, fieldLabel: null }], dateOfBirth: dob, category: 'General',
      disabilityTypes: [], disabilityPercent: null, specialStatuses: [], gender: 'Male', domicileStateCode: null,
      experienceYears: null, certifications: [], heightCm: null, chestCm: null, preferredRoleIds: [], preferredEmploymentTypes: [],
    },
  });

  let wrong = 0;
  console.log(`Rows: each qualification held alone. Columns: ${required.map((r) => r.name).join(' | ')}\n`);
  for (const q of rows) {
    const cells = required.map((req) => {
      const expected = q.level >= req.level && !(vocational(q) && req.level >= 3);
      const post: any = { title: 'T', minAge: 18, maxAge: 60, employmentType: 'PERMANENT', qualifications: [{ id: req.id }] };
      const got = evaluatePost(ctxFor(q), post).verdict === 'eligible';
      if (got !== expected) wrong++;
      return got === expected ? (got ? 'yes' : 'no ') : 'WRONG';
    });
    console.log(`  L${q.level} ${q.name.padEnd(34)} ${cells.join('   ')}`);
  }
  console.log(`\n${wrong === 0 ? 'Every cell matches the rule.' : `${wrong} cells disagree with the rule.`}`);
  if (wrong > 0) process.exit(1);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
