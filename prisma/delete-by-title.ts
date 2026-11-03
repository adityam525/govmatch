import 'dotenv/config';
import { prisma } from '../lib/prisma';

const apply = process.argv.includes('--apply');
const TITLES = ['Test Jobs', 'Recruitment 2026'];
async function main() {
  const rows = await prisma.notification.findMany({ where: { title: { in: TITLES } }, select: { id: true, title: true, published: true, officialLink: true } });
  rows.forEach((r) => console.log((apply ? 'deleting: ' : 'would delete: ') + r.title + ' | ' + r.officialLink + ' | ' + (r.published ? 'PUBLISHED' : 'draft')));
  if (apply) for (const r of rows) await prisma.notification.delete({ where: { id: r.id } });
  console.log('\n' + rows.length + ' job(s). ' + (apply ? 'Deleted.' : 'Preview only. Re-run with --apply.'));
}
main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
