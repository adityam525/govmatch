import 'dotenv/config';
import { prisma } from '../lib/prisma';

async function main() {
  const t = await prisma.qualificationCategory.findUnique({ where: { name: '5th Pass' }, select: { id: true, _count: { select: { qualifications: true } } } });
  if (!t) { console.log('No "5th Pass" education type. Nothing to do.'); return; }
  if (t._count.qualifications > 0) { console.log(`"5th Pass" is still used by ${t._count.qualifications} qualification(s). Left alone.`); return; }
  await prisma.qualificationCategory.delete({ where: { id: t.id } });
  console.log('Deleted the empty "5th Pass" education type.');
}
main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
