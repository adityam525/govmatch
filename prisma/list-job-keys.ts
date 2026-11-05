import 'dotenv/config';
import { prisma } from '../lib/prisma';
async function main() {
  const rows = await prisma.notification.findMany({ orderBy: { createdAt: 'desc' }, select: { title: true, slug: true, officialLink: true, advertisementNo: true, published: true } });
  rows.forEach((r) => console.log((r.published ? 'pub ' : 'draft') + ' | ' + r.slug + ' | ' + r.officialLink + ' | ' + (r.advertisementNo ?? '-')));
  console.log('\n' + rows.length + ' jobs');
}
main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
