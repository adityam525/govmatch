import 'dotenv/config';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { legacyRelaxationMap, parseRules } from '../lib/special-categories';

// Usage: npx tsx prisma/set-relaxation.ts <job-slug> [--clear]
const slug = process.argv[2];
const clear = process.argv.includes('--clear');

async function main() {
  if (!slug || slug.startsWith('--')) {
    console.error('Usage: npx tsx prisma/set-relaxation.ts <job-slug> [--clear]');
    process.exit(1);
  }

  const post = await prisma.post.findFirst({
    where: { notification: { slug } },
    orderBy: { createdAt: 'asc' },
    select: { id: true, title: true, minAge: true, maxAge: true },
  });
  if (!post) {
    console.error(`No post found for a job with slug "${slug}".`);
    process.exit(1);
  }
  console.log(`Post: ${post.title} (age limit ${post.minAge ?? '-'} to ${post.maxAge ?? '-'})`);

  if (clear) {
    await prisma.post.update({
      where: { id: post.id },
      data: { relaxationRules: Prisma.DbNull, ageRelaxation: Prisma.DbNull, pwdTypes: [] },
    });
    console.log('Cleared the relaxation rules.');
    return;
  }

  if (post.maxAge == null) console.log('Warning: this post has no maximum age, so relaxation has nothing to extend.');

  const { rules, errors } = parseRules([
    { category: 'OBC', status: 'NONE', years: 3 },
    { category: 'ANY', status: 'PWD', years: 10 },
    { category: 'ANY', status: 'EX_SERVICEMAN', maxAge: 50 },
  ]);
  if (errors.length > 0) throw new Error(errors.join(' '));

  await prisma.post.update({
    where: { id: post.id },
    data: {
      relaxationRules: rules as unknown as Prisma.InputJsonValue,
      ageRelaxation: legacyRelaxationMap(rules),
      pwdTypes: ['LOCOMOTOR', 'VISUAL'],
    },
  });
  console.log('Saved. Rules:', JSON.stringify(rules));
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
