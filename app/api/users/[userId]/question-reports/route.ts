import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireSelf } from '@/lib/require-user';
import { rateLimit } from '@/lib/rate-limit';

interface Params { params: Promise<{ userId: string }> }
export const REASONS = ['NO_CORRECT_OPTION', 'WRONG_ANSWER', 'ANOTHER_ALSO_CORRECT', 'TYPO', 'UNCLEAR', 'OTHER'];

export async function POST(request: Request, { params }: Params) {
  const { userId } = await params;
  const guard = await requireSelf(userId);
  if (!guard.ok) return guard.response;
  if (!rateLimit('qreport:' + userId, 20, 3_600_000).allowed) return NextResponse.json({ message: 'You have sent many reports. Please try again later.' }, { status: 429 });

  const b = await request.json().catch(() => ({}));
  const questionId = typeof b.questionId === 'string' ? b.questionId.slice(0, 60) : '';
  const reason = typeof b.reason === 'string' ? b.reason : '';
  const comment = typeof b.comment === 'string' ? b.comment.trim().slice(0, 500) : '';
  if (!REASONS.includes(reason)) return NextResponse.json({ message: 'Choose what is wrong.' }, { status: 400 });
  if (reason === 'OTHER' && comment.length < 5) return NextResponse.json({ message: 'Please describe the problem.' }, { status: 400 });

  try {
    // Prefer the stored question; fall back to what the page sent if the id is not a stored question.
    const q = questionId ? await prisma.mockQuestion.findUnique({ where: { id: questionId }, select: { text: true, options: true, correctIndex: true, templateId: true } }) : null;
    const text = q?.text ?? (typeof b.text === 'string' ? b.text.slice(0, 2000) : '');
    const options = q?.options ?? (Array.isArray(b.options) ? b.options.slice(0, 8).map((o: unknown) => String(o).slice(0, 300)) : []);
    const correctIndex = q?.correctIndex ?? (Number.isInteger(b.correctIndex) ? b.correctIndex : 0);
    if (!text || options.length < 2) return NextResponse.json({ message: 'Could not identify the question.' }, { status: 400 });

    if (questionId && (await prisma.questionReport.findFirst({ where: { userId, questionId, status: 'OPEN' }, select: { id: true } }))) {
      return NextResponse.json({ message: 'You have already reported this question. Thank you.' });
    }
    await prisma.questionReport.create({ data: { userId, questionId: questionId || null, templateId: q?.templateId ?? null, reason, comment: comment || null, text, options: options as unknown as Prisma.InputJsonValue, correctIndex } });
    return NextResponse.json({ message: 'Thank you. We will check this question.' }, { status: 201 });
  } catch (error) {
    console.error('Question report failed:', error);
    return NextResponse.json({ message: 'Could not send the report. Please try again.' }, { status: 500 });
  }
}
