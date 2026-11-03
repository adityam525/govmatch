import 'dotenv/config';
import { prisma } from '../lib/prisma';

const apply = process.argv.includes('--apply');
async function main() {
  const jobs = await prisma.notification.findMany({ select: { id: true, title: true, published: true } });
  const saved = await prisma.savedJob.count();
  const applied = await prisma.application.count();
  const linked = await prisma.mockTest.count({ where: { notificationId: { not: null } } });
  jobs.forEach((j) => console.log((apply ? 'deleting: ' : 'would delete: ') + j.title + ' (' + (j.published ? 'published' : 'draft') + ')'));
  console.log('\n' + jobs.length + ' jobs. Users hold ' + saved + ' saved-job rows and ' + applied + ' application rows. ' + linked + ' mock tests are linked to a job.');
  if (!apply) { console.log('Preview only. Re-run with --apply.'); return; }
  // One at a time, so a slow moment on the database cannot time out a big delete.
  for (const j of jobs) await prisma.notification.delete({ where: { id: j.id } });
  console.log('Deleted.');
}
main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
