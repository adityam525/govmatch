import 'dotenv/config';
import { prisma } from '../lib/prisma';

async function main() {
  const [subjects, chapters, topics, templates] = await Promise.all([
    prisma.qbSubject.findMany(), prisma.qbChapter.findMany(), prisma.qbTopic.findMany(),
    prisma.qbTemplate.findMany({ where: { published: true }, select: { topicId: true } }),
  ]) as any[][];
  const count = new Map<string, number>();
  for (const t of templates) count.set(t.topicId, (count.get(t.topicId) ?? 0) + 1);
  let withQ = 0, without = 0;
  for (const s of subjects) {
    const chs = chapters.filter((c: any) => c.subjectId === s.id);
    const tps = topics.filter((t: any) => chs.some((c: any) => c.id === t.chapterId));
    const have = tps.filter((t: any) => count.get(t.id));
    withQ += have.length; without += tps.length - have.length;
    console.log('\n' + s.name + ': ' + have.length + ' of ' + tps.length + ' topics have questions');
    for (const c of chs) {
      const ct = topics.filter((t: any) => t.chapterId === c.id);
      const empty = ct.filter((t: any) => !count.get(t.id));
      if (empty.length) console.log('  ' + c.name + ' - empty: ' + empty.map((t: any) => t.name).join(', '));
    }
  }
  console.log('\nTotal: ' + withQ + ' topics with questions, ' + without + ' without.');
}
main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
