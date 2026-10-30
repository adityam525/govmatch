import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireSelf } from '@/lib/require-user';
import { expiresAtMs, snapshotFromTest } from '@/lib/mock-attempt';

interface Params { params: Promise<{ userId: string }> }

// Starts an exam, or resumes the one still running for this test.
export async function POST(request: Request, { params }: Params) {
  const { userId } = await params;
  const guard = await requireSelf(userId);
  if (!guard.ok) return guard.response;

  const body = await request.json().catch(() => ({}));
  const testId = typeof body.testId === 'string' ? body.testId : '';
  if (!testId) return NextResponse.json({ message: 'Choose a test.' }, { status: 400 });

  try {
    const test = await prisma.mockTest.findFirst({
      where: { id: testId, OR: [{ userId: null, published: true }, { userId }] },
      include: { sections: { orderBy: { order: 'asc' }, include: { questions: { orderBy: { order: 'asc' } } } } },
    });
    if (!test) return NextResponse.json({ message: 'That test is not available.' }, { status: 404 });
    if (test.sections.every((s) => s.questions.length === 0)) return NextResponse.json({ message: 'This test has no questions yet.' }, { status: 400 });

    const running = await prisma.mockAttempt.findFirst({
      where: { userId, testId, submittedAt: null, expiresAt: { gt: new Date() } },
      select: { id: true },
    });
    if (running) return NextResponse.json({ id: running.id, resumed: true });

    const snapshot = snapshotFromTest(test as any);
    const startedAt = new Date();
    const created = await prisma.mockAttempt.create({
      data: {
        testId, userId, startedAt,
        expiresAt: new Date(expiresAtMs(snapshot, startedAt.getTime())),
        snapshot: snapshot as unknown as Prisma.InputJsonValue,
        answers: {},
      },
      select: { id: true },
    });
    return NextResponse.json({ id: created.id, resumed: false }, { status: 201 });
  } catch (error) {
    console.error('Failed to start exam:', error);
    return NextResponse.json({ message: 'Could not start the test. Please try again.' }, { status: 500 });
  }
}
