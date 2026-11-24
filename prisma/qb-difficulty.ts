import 'dotenv/config';
import { prisma } from '../lib/prisma';

async function main() {
  const [subjects, chapters, topics, templates] = await Promise.all([
    prisma.qbSubject.findMany(), prisma.qbChapter.findMany(), prisma.qbTopic.findMany(),
    prisma.qbTemplate.findMany({ where: { published: true }, select: { topicId: true, difficulty: true } }),
  ]) as any[][];
  for (const s of subjects) {
    const chIds = new Set(chapters.filter((c: any) => c.subjectId === s.id).map((c: any) => c.id));
    const tIds = new Set(topics.filter((t: any) => chIds.has(t.chapterId)).map((t: any) => t.id));
    const mine = templates.filter((t: any) => tIds.has(t.topicId));
    const n = (d: string) => mine.filter((t: any) => t.difficulty === d).length;
    console.log(s.name.padEnd(24) + 'EASY ' + String(n('EASY')).padStart(4) + '   MEDIUM ' + String(n('MEDIUM')).padStart(4) + '   HARD ' + String(n('HARD')).padStart(4));
  }
}
main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
