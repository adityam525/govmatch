import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireSelf } from '@/lib/require-user';
import { activeSection, clientView, finalize, isExpired, isTimed, windows, type Snapshot } from '@/lib/mock-attempt';
import type { AnswerState } from '@/lib/mock-test';

interface Params { params: Promise<{ userId: string; attemptId: string }> }

// Everything the exam screen needs. If time ran out while the browser was away, the test is submitted here.
export async function GET(_req: Request, { params }: Params) {
  const { userId, attemptId } = await params;
  const guard = await requireSelf(userId);
  if (!guard.ok) return guard.response;

  let attempt = await prisma.mockAttempt.findFirst({ where: { id: attemptId, userId } });
  if (!attempt) return NextResponse.json({ message: 'That exam no longer exists.' }, { status: 404 });

  const snapshot = attempt.snapshot as unknown as Snapshot;
  const startMs = attempt.startedAt.getTime();
  const now = Date.now();
  const answers = (attempt.answers ?? {}) as unknown as Record<string, AnswerState>;

  if (!attempt.submittedAt && isExpired(snapshot, startMs, now)) {
    attempt = await prisma.mockAttempt.update({
      where: { id: attempt.id },
      data: { submittedAt: attempt.expiresAt, result: finalize(snapshot, answers) as unknown as Prisma.InputJsonValue },
    });
  }

  const submitted = !!attempt.submittedAt;
  return NextResponse.json({
    id: attempt.id,
    testId: attempt.testId,
    title: snapshot.title,
    submitted,
    serverNow: now,
    startedAt: startMs,
    expiresAt: attempt.expiresAt.getTime(),
    timed: isTimed(snapshot),
    windows: windows(snapshot, startMs),
    activeSection: submitted ? null : activeSection(snapshot, startMs, now),
    sections: clientView(snapshot, submitted),
    answers: (attempt.answers ?? {}) as unknown as Record<string, AnswerState>,
    result: submitted ? attempt.result : null,
  });
}
