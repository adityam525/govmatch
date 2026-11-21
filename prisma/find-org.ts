import 'dotenv/config';
import { prisma } from '../lib/prisma';
async function main() {
  for (const q of process.argv.slice(2)) {
    const rows = await prisma.organization.findMany({ where: { OR: [{ name: { contains: q, mode: 'insensitive' } }, { shortName: { contains: q, mode: 'insensitive' } }] }, select: { name: true, shortName: true }, take: 8 });
    console.log(q + ': ' + (rows.length ? rows.map((r) => r.shortName + ' (' + r.name + ')').join('; ') : 'none'));
  }
}
main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
