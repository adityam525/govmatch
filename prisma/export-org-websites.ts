import 'dotenv/config';
import fs from 'fs';
import { prisma } from '../lib/prisma';
async function main() {
  const orgs = await prisma.organization.findMany({ orderBy: { name: 'asc' }, select: { name: true, shortName: true, website: true, category: { select: { name: true } } } });
  const bad = new Set(fs.existsSync('/tmp/orgcheck.txt') ? fs.readFileSync('/tmp/orgcheck.txt', 'utf8').split('\n').filter((l) => l.includes(' | ')).map((l) => l.split(' | ')[0].trim()) : []);
  fs.mkdirSync('exports', { recursive: true });
  const rows = ['Name,Short name,Sector,Website,Status'];
  for (const o of orgs) {
    const status = !o.website ? 'MISSING' : bad.has(o.shortName) ? 'CHECK (did not open)' : 'ok';
    if (status !== 'ok') rows.push([o.name, o.shortName, o.category?.name ?? '', o.website ?? '', status].map((v) => '"' + v.replace(/"/g, '""') + '"').join(','));
  }
  fs.writeFileSync('exports/org-websites-to-fix.csv', rows.join('\n'));
  console.log((rows.length - 1) + ' organizations to fix. Written to exports/org-websites-to-fix.csv');
}
main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
