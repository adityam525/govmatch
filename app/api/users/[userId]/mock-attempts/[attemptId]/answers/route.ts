import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireSelf } from '@/lib/require-user';
import { mergeAnswers, type Snapshot } from '@/lib/mock-attempt';
import type { AnswerState } from '@/lib/mock-test';

interface Params { params: Promise<{ userId: string; attemptId: string }> }

// Autosave. Answers for locked sections, or sent after time is up, are ignored.
export async function PUT(request: Request, { params }: Params) {
  const { userId, attemptId } = await params;
  const guard = await requireSelf(userId);
  if (!guard.ok) return guard.response;

  const attempt = await prisma.mockAttempt.findFirst({ where: { id: attemptId, userId } });
  if (!attempt) return NextResponse.json({ message: 'That exam no longer exists.' }, { status: 404 });
  if (attempt.submittedAt) return NextResponse.json({ message: 'This test has already been submitted.' }, { status: 409 });

  const body = await request.json().catch(() => ({}));
  const merged = mergeAnswers(
    attempt.snapshot as unknown as Snapshot, attempt.startedAt.getTime(), Date.now(),
    (attempt.answers ?? {}) as unknown as Record<string, AnswerState>, body.answers,
  );
  if (!merged) return NextResponse.json({ message: 'Time is up.' }, { status: 409 });

  await prisma.mockAttempt.update({ where: { id: attempt.id }, data: { answers: merged as unknown as Prisma.InputJsonValue } });
  return NextResponse.json({ saved: true, serverNow: Date.now() });
}
