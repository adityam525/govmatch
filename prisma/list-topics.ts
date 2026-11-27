import 'dotenv/config';
import { prisma } from '../lib/prisma';
// Usage: npx tsx prisma/list-topics.ts "Time and Work" "Profit and Loss" ... (no arguments lists every chapter)
async function main() {
  const want = process.argv.slice(2);
  const [chapters, topics] = await Promise.all([
    prisma.qbChapter.findMany({ where: want.length ? { name: { in: want } } : undefined, select: { id: true, name: true }, orderBy: { name: 'asc' } }),
    prisma.qbTopic.findMany({ select: { name: true, chapterId: true } }),
  ]);
  for (const c of chapters) console.log(c.name + ': ' + topics.filter((t) => t.chapterId === c.id).map((t) => t.name).join(', '));
}
main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
