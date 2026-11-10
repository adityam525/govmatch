import 'dotenv/config';
import { prisma } from '../lib/prisma';
async function main() {
  const orgs = await prisma.organization.findMany({ where: { OR: [{ website: null }, { website: '' }] }, select: { name: true, shortName: true, _count: { select: { notifications: true } } }, orderBy: { name: 'asc' } });
  orgs.forEach((o) => console.log(o.shortName.padEnd(14) + String(o._count.notifications).padStart(3) + ' jobs  ' + o.name));
}
main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
