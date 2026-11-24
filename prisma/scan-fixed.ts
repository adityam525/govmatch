import 'dotenv/config';
import { prisma } from '../lib/prisma';
const BAD = ['hadto', 'thisfresh', 'yetread', 'resultof'];
async function main() {
  const rows = await prisma.qbTemplate.findMany({ where: { slug: { startsWith: 'fx-' } }, select: { title: true, definition: true } });
  let hits = 0;
  for (const r of rows) { const t = JSON.stringify(r.definition); for (const b of BAD) if (t.includes(b)) { hits++; console.log('FOUND "' + b + '" in: ' + r.title.slice(0, 60)); } }
  console.log(rows.length + ' fixed questions scanned, ' + hits + ' problems.');
}
main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
