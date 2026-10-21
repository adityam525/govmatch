import 'dotenv/config';
import { prisma } from '../lib/prisma';
import { computeMatch } from '../features/matching/engine';

async function main() {
  const quals = await prisma.qualification.findMany({
    select: { name: true, slug: true, level: true, categories: { select: { name: true } } },
    orderBy: [{ level: 'asc' }, { name: 'asc' }],
  });
  console.log('Qualifications by level:');
  for (const q of quals) {
    console.log(`  level ${String(q.level).padStart(2)}  ${q.name.padEnd(34)} [${q.categories.map((c) => c.name).join(', ')}]`);
  }

  const tenth = quals.find((q) => q.slug === '10th-pass') ?? quals[0];
  const levels = [...new Set(quals.map((q) => q.level))].sort((a, b) => a - b);
  const dob = new Date();
  dob.setFullYear(dob.getFullYear() - 25);

  console.log(`\nJob needs level ${tenth.level} (${tenth.name}). User is 25, no preferences. Engine verdict by user level:`);
  let sample: unknown = null;
  for (const level of [null, ...levels]) {
    try {
      const result = computeMatch(
        { dateOfBirth: dob, category: null, qualificationLevel: level, branchId: null, preferredRoleIds: [], preferredEmploymentTypes: [] } as any,
        { minAge: 18, maxAge: 40, qualificationLevel: tenth.level, branchIds: [], roleIds: [], employmentType: 'PERMANENT' } as any,
      );
      if (level === levels[levels.length - 1]) sample = result;
      console.log(`  user level ${String(level).padEnd(4)} eligible=${String(result.eligible).padEnd(5)} score=${result.score}`);
    } catch (error) {
      console.log(`  user level ${level}: the engine threw: ${(error as Error).message}`);
    }
  }
  console.log('\nFull engine result for the highest level:');
  console.log(JSON.stringify(sample, null, 2));
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
