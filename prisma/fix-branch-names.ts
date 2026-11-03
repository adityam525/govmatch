import 'dotenv/config';
import { prisma } from '../lib/prisma';

const apply = process.argv.includes('--apply');
const FIXES: [string, string][] = [['ProductionEngineering', 'Production Engineering'], ['AgriculturalEngineering', 'Agricultural Engineering']];

async function main() {
  for (const [from, to] of FIXES) {
    const row = await prisma.branch.findUnique({ where: { name: from }, select: { id: true } });
    if (!row) { console.log(`${from}: not found (already fixed?)`); continue; }
    if (await prisma.branch.findUnique({ where: { name: to }, select: { id: true } })) { console.log(`${to} already exists, left ${from} alone`); continue; }
    console.log(`${apply ? 'renaming' : 'would rename'} "${from}" to "${to}"`);
    if (apply) await prisma.branch.update({ where: { id: row.id }, data: { name: to } });
  }
}
main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
