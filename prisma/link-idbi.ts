import 'dotenv/config';
import { prisma } from '../lib/prisma';
async function main() {
  const org = await prisma.organization.findFirst({ where: { shortName: { equals: 'IDBI', mode: 'insensitive' } }, select: { id: true } });
  if (!org) throw new Error('Add the IDBI organization in Admin first.');
  const r = await prisma.qbExam.updateMany({ where: { name: 'IDBI Junior Assistant Manager', organizationId: null }, data: { organizationId: org.id } });
  console.log('linked: ' + r.count);
}
main().catch((e) => { console.error(e.message ?? e); process.exit(1); }).finally(() => prisma.$disconnect());
