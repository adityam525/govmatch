import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Public: subjects, chapters, topics (with how many published templates each has) and exam syllabi.
export async function GET() {
  const [subjects, counts, exams] = await Promise.all([
    prisma.qbSubject.findMany({
      orderBy: { order: 'asc' },
      select: { id: true, name: true, chapters: { orderBy: { order: 'asc' }, select: { id: true, name: true, topics: { orderBy: { order: 'asc' }, select: { id: true, name: true } } } } },
    }),
    prisma.qbTemplate.groupBy({ by: ['topicId'], where: { published: true }, _count: { _all: true } }),
    prisma.qbExam.findMany({ orderBy: [{ name: 'asc' }, { stage: 'asc' }], select: { id: true, name: true, stage: true, topics: { select: { topicId: true } } } }),
  ]);
  const count = new Map(counts.map((c) => [c.topicId, c._count._all]));
  return NextResponse.json({
    subjects: subjects.map((s) => ({ ...s, chapters: s.chapters.map((c) => ({ ...c, topics: c.topics.map((t) => ({ ...t, templates: count.get(t.id) ?? 0 })) })) })),
    exams: exams.map((e) => ({ id: e.id, name: e.name, stage: e.stage, topicIds: e.topics.map((t) => t.topicId) })),
  }, { headers: { 'Cache-Control': 'public, max-age=300' } });
}
