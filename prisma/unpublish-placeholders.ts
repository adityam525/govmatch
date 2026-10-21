import 'dotenv/config';
import { prisma } from '../lib/prisma';

const apply = process.argv.includes('--apply');

async function main() {
  const jobs = await prisma.notification.findMany({
    where: {
      published: true,
      OR: [
        { title: { contains: 'replace every value', mode: 'insensitive' } },
        { officialLink: { contains: 'example.com', mode: 'insensitive' } },
      ],
    },
    select: { id: true, title: true, officialLink: true },
    orderBy: { createdAt: 'asc' },
  });

  console.log(`${jobs.length} published jobs look like placeholders:`);
  for (const job of jobs) console.log(`  ${job.title}  |  ${job.officialLink}  |  id ${job.id}`);

  if (!apply) {
    console.log('\nPreview only. Re-run with --apply to unpublish them.');
    return;
  }
  const res = await prisma.notification.updateMany({
    where: { id: { in: jobs.map((j) => j.id) } },
    data: { published: false },
  });
  console.log(`\nUnpublished ${res.count} jobs.`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
