import 'dotenv/config';
import { prisma } from '../lib/prisma';

async function main() {
  const jobs = await prisma.notification.findMany({
    select: { id: true, title: true, totalVacancies: true, posts: { select: { vacancies: true } } },
  });
  let changed = 0;
  for (const job of jobs) {
    if (job.posts.length === 0) continue;
    const total = job.posts.reduce((sum, post) => sum + post.vacancies, 0);
    if (total === job.totalVacancies) continue;
    await prisma.notification.update({ where: { id: job.id }, data: { totalVacancies: total } });
    console.log(`${job.title}: ${job.totalVacancies} -> ${total}`);
    changed++;
  }
  console.log(`Updated ${changed} of ${jobs.length} jobs.`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
