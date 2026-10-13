import 'dotenv/config';
import { prisma } from '../lib/prisma';

const apply = process.argv.includes('--apply');

function todayStartIST(): Date {
  const ist = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
  return new Date(`${ist.toISOString().slice(0, 10)}T00:00:00.000Z`);
}

async function main() {
  const expired = await prisma.notification.findMany({
    where: { status: 'LIVE', applicationEndDate: { lt: todayStartIST() } },
    select: { id: true, title: true, applicationEndDate: true, published: true },
    orderBy: { applicationEndDate: 'asc' },
  });

  console.log(`${expired.length} LIVE jobs have a deadline in the past:`);
  for (const j of expired) {
    const when = j.applicationEndDate?.toISOString().slice(0, 10);
    console.log(` - [${j.published ? 'published' : 'draft'}] ${j.title} (ended ${when})`);
  }

  if (!apply) {
    console.log('\nPreview only. Re-run with --apply to set these to CLOSED.');
    return;
  }
  const res = await prisma.notification.updateMany({
    where: { id: { in: expired.map((j) => j.id) } },
    data: { status: 'CLOSED' },
  });
  console.log(`\nClosed ${res.count} jobs.`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
