import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSelf } from '@/lib/require-user';
import { LIMITS, toSectionCreate, validateTest } from '@/lib/mock-test';

interface Params { params: Promise<{ userId: string }> }

export async function GET(_req: Request, { params }: Params) {
  const { userId } = await params;
  const guard = await requireSelf(userId);
  if (!guard.ok) return guard.response;

  const tests = await prisma.mockTest.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true, title: true, examStyle: true, durationMinutes: true, updatedAt: true,
      _count: { select: { attempts: true } },
      sections: { select: { _count: { select: { questions: true } } } },
    },
  });
  return NextResponse.json(
    tests.map((t) => ({
      id: t.id, title: t.title, examStyle: t.examStyle, durationMinutes: t.durationMinutes, updatedAt: t.updatedAt,
      attempts: t._count.attempts,
      questionCount: t.sections.reduce((n, s) => n + s._count.questions, 0),
    })),
  );
}

export async function POST(request: Request, { params }: Params) {
  const { userId } = await params;
  const guard = await requireSelf(userId);
  if (!guard.ok) return guard.response;

  try {
    const result = validateTest(await request.json().catch(() => null));
    if ('error' in result) return NextResponse.json({ message: result.error }, { status: 400 });

    // Placeholder limit for every user until Premium limits are decided.
    if ((await prisma.mockTest.count({ where: { userId } })) >= LIMITS.tests) {
      return NextResponse.json({ message: `You can keep up to ${LIMITS.tests} tests. Delete one to add another.` }, { status: 403 });
    }

    const { data } = result;
    const created = await prisma.mockTest.create({
      data: {
        userId, title: data.title, description: data.description, examStyle: data.examStyle, durationMinutes: data.durationMinutes,
        sections: { create: toSectionCreate(data.sections) },
      },
      select: { id: true },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Failed to create mock test:', error);
    return NextResponse.json({ message: 'Could not save the test. Nothing was changed.' }, { status: 500 });
  }
}
