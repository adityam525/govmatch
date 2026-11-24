import 'dotenv/config';
import { prisma } from '../lib/prisma';

// Deletes fixed questions (slug starts with fx-) of one topic, so a batch can be reloaded.
const apply = process.argv.includes('--apply');
const topic = process.argv.find((a, i) => i > 1 && !a.startsWith('--'));
async function main() {
  if (!topic) throw new Error('Usage: npx tsx prisma/drop-fixed-topic.ts "Topic name" [--apply]');
  const rows = await prisma.qbTemplate.findMany({ where: { slug: { startsWith: 'fx-' }, topic: { name: topic } }, select: { id: true, title: true, published: true } });
  rows.forEach((r) => console.log((apply ? 'deleting: ' : 'would delete: ') + r.title + (r.published ? '  [published]' : '')));
  if (apply && rows.length) await prisma.qbTemplate.deleteMany({ where: { id: { in: rows.map((r) => r.id) } } });
  console.log('\n' + (apply ? 'Deleted' : 'Would delete') + ': ' + rows.length + '.');
  if (!apply) console.log('Preview only. Re-run with --apply.');
}
main().catch((e) => { console.error(e.message ?? e); process.exit(1); }).finally(() => prisma.$disconnect());
