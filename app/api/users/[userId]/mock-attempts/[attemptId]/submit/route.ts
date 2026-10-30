import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireSelf } from '@/lib/require-user';
import { finalize, mergeAnswers, type Snapshot } from '@/lib/mock-attempt';
import type { AnswerState } from '@/lib/mock-test';

interface Params { params: Promise<{ userId: string; attemptId: string }> }

// Final submit. Safe to call twice: the second call just returns the stored result.
export async function POST(request: Request, { params }: Params) {
  const { userId, attemptId } = await params;
  const guard = await requireSelf(userId);
  if (!guard.ok) return guard.response;

  const attempt = await prisma.mockAttempt.findFirst({ where: { id: attemptId, userId } });
  if (!attempt) return NextResponse.json({ message: 'That exam no longer exists.' }, { status: 404 });
  if (attempt.submittedAt) return NextResponse.json({ submitted: true, result: attempt.result });

  const snapshot = attempt.snapshot as unknown as Snapshot;
  const body = await request.json().catch(() => ({}));
  let answers = (attempt.answers ?? {}) as unknown as Record<string, AnswerState>;
  if (body.answers) answers = mergeAnswers(snapshot, attempt.startedAt.getTime(), Date.now(), answers, body.answers) ?? answers;

  const result = finalize(snapshot, answers);
  await prisma.mockAttempt.update({
    where: { id: attempt.id },
    data: { answers: answers as unknown as Prisma.InputJsonValue, submittedAt: new Date(), result: result as unknown as Prisma.InputJsonValue },
  });
  return NextResponse.json({ submitted: true, result });
}
