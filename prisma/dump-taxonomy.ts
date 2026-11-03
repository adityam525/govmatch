import 'dotenv/config';
import { prisma } from '../lib/prisma';

async function main() {
  const quals = await prisma.qualification.findMany({
    orderBy: [{ level: 'asc' }, { name: 'asc' }],
    select: {
      name: true, slug: true, level: true,
      categories: { select: { name: true } },
      branches: { select: { name: true } },
      _count: { select: { posts: true, postsMultiQual: true, userProfiles: true, educations: true } },
    },
  });
  for (const q of quals) {
    const use = q._count;
    console.log(`L${q.level} ${q.name} [${q.slug}] types: ${q.categories.map((c) => c.name).join(', ') || '-'}`);
    console.log(`   used by: posts ${use.posts + use.postsMultiQual}, profiles ${use.userProfiles}, educations ${use.educations} | branches (${q.branches.length}): ${q.branches.map((b) => b.name).join(', ') || '-'}`);
  }
  const cats = await prisma.qualificationCategory.findMany({ orderBy: { order: 'asc' }, select: { name: true, slug: true, _count: { select: { qualifications: true } } } });
  console.log('\nEDUCATION TYPES: ' + cats.map((c) => `${c.name} (${c._count.qualifications})`).join(', '));
}
main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
