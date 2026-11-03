import 'dotenv/config';
import { prisma } from '../lib/prisma';

const apply = process.argv.includes('--apply');
async function main() {
  const rows = await prisma.notification.findMany({
    where: { OR: [{ title: { contains: 'replace every value', mode: 'insensitive' } }, { title: { startsWith: 'EXAMPLE', mode: 'insensitive' } }] },
    select: { id: true, title: true, published: true },
  });
  rows.forEach((r) => console.log(`${apply ? 'deleting' : 'would delete'}: ${r.title} (${r.published ? 'PUBLISHED' : 'draft'})`));
  if (apply) for (const r of rows) await prisma.notification.delete({ where: { id: r.id } });
  console.log(`\n${rows.length} job(s). ${apply ? 'Deleted.' : 'Preview only. Re-run with --apply.'}`);
}
main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
