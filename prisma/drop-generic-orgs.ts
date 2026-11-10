import 'dotenv/config';
import { prisma } from '../lib/prisma';

const apply = process.argv.includes('--apply');
const SHORT = ['Central Universities', 'IITs', 'IIITs', 'IIMs', 'IISERs', 'NITs'];
async function main() {
  const rows = await prisma.organization.findMany({ where: { shortName: { in: SHORT } }, select: { id: true, name: true, shortName: true, _count: { select: { notifications: true, qbTemplates: true } } } });
  for (const o of rows) {
    if (o._count.notifications > 0 || o._count.qbTemplates > 0) { console.log('kept (in use): ' + o.name); continue; }
    console.log((apply ? 'deleting: ' : 'would delete: ') + o.name);
    if (apply) await prisma.organization.delete({ where: { id: o.id } });
  }
  if (!apply) console.log('\nPreview only. Re-run with --apply.');
}
main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
