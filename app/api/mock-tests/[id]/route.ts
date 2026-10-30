import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Params { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const t = await prisma.mockTest.findFirst({
    where: { id, userId: null, published: true },
    select: {
      id: true, title: true, description: true, durationMinutes: true,
      sections: { orderBy: { order: 'asc' }, select: { name: true, durationMinutes: true, questions: { select: { marks: true, negativeMarks: true } } } },
    },
  });
  if (!t) return NextResponse.json({ message: 'That test is not available.' }, { status: 404 });

  const timed = t.sections.length > 0 && t.sections.every((s) => s.durationMinutes != null);
  return NextResponse.json({
    id: t.id,
    title: t.title,
    description: t.description,
    timed,
    durationMinutes: timed ? t.sections.reduce((n, s) => n + (s.durationMinutes ?? 0), 0) : t.durationMinutes,
    totalMarks: Math.round(t.sections.flatMap((s) => s.questions).reduce((n, q) => n + q.marks, 0) * 100) / 100,
    negativeMarking: t.sections.some((s) => s.questions.some((q) => q.negativeMarks > 0)),
    sections: t.sections.map((s) => ({ name: s.name, durationMinutes: s.durationMinutes, questions: s.questions.length })),
  });
}
