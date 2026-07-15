import 'dotenv/config';
import { prisma } from '../lib/prisma';

async function main() {
  const rrbPost = await prisma.post.findFirst({ where: { notification: { slug: 'rrb-technician-2026' } } });
  if (rrbPost) {
    await prisma.post.update({
      where: { id: rrbPost.id },
      data: {
        categoryWiseVacancies: { General: 2650, OBC: 1750, SC: 980, ST: 490, EWS: 687 },
      },
    });
  }

  const sscPost = await prisma.post.findFirst({ where: { notification: { slug: 'ssc-aso-2026' } } });
  if (sscPost) {
    await prisma.post.update({
      where: { id: sscPost.id },
      data: {
        categoryWiseVacancies: { General: 140, OBC: 90, SC: 50, ST: 25, EWS: 36 },
      },
    });
  }

  console.log('Vacancy breakdown backfill complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
