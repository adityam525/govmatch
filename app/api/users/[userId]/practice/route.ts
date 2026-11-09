import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireSelf } from '@/lib/require-user';
import { isPremiumUser } from '@/lib/plan';
import { composeTest, MAX_QUESTIONS, type Level } from '@/lib/qb/compose';
import { expiresAtMs, snapshotFromTest } from '@/lib/mock-attempt';
import type { TemplateDef } from '@/lib/qb/template';

interface Params { params: Promise<{ userId: string }> }

export const FREE_SETS_PER_DAY = 3;
export const FREE_MAX_QUESTIONS = 10;
const DEFAULT_MIX = { EASY: 30, MEDIUM: 50, HARD: 20 };
const IST_MS = 19_800_000;

const startOfIstDay = () => new Date(Math.floor((Date.now() + IST_MS) / 86_400_000) * 86_400_000 - IST_MS);
const num = (v: unknown, min: number, max: number, fallback: number) => {
  const n = Number(v);
  return v === '' || v === null || v === undefined || !Number.isFinite(n) ? fallback : Math.min(max, Math.max(min, n));
};

async function usage(userId: string) {
  const [premium, used] = await Promise.all([
    isPremiumUser(userId),
    prisma.mockTest.count({ where: { userId, source: 'PRACTICE', createdAt: { gte: startOfIstDay() } } }),
  ]);
  return { premium, used };
}

export async function GET(_req: Request, { params }: Params) {
  const { userId } = await params;
  const guard = await requireSelf(userId);
  if (!guard.ok) return guard.response;
  const { premium, used } = await usage(userId);
  return NextResponse.json({ premium, used, limit: premium ? null : FREE_SETS_PER_DAY, maxQuestions: premium ? MAX_QUESTIONS : FREE_MAX_QUESTIONS });
}

export async function POST(request: Request, { params }: Params) {
  const { userId } = await params;
  const guard = await requireSelf(userId);
  if (!guard.ok) return guard.response;
  const body = await request.json().catch(() => ({}));

  try {
    const { premium, used } = await usage(userId);
    if (!premium && used >= FREE_SETS_PER_DAY) {
      return NextResponse.json({ message: 'You have used your ' + FREE_SETS_PER_DAY + ' free practice sets for today. Premium has no daily limit.' }, { status: 403 });
    }

    const topicIds: string[] = Array.isArray(body.topicIds) ? body.topicIds.filter((x: unknown): x is string => typeof x === 'string').slice(0, 300) : [];
    if (topicIds.length === 0) return NextResponse.json({ message: 'Choose at least one topic.' }, { status: 400 });

    const templates = await prisma.qbTemplate.findMany({
      where: { published: true, topicId: { in: topicIds }, ...(typeof body.examId === 'string' && body.examId ? { OR: [{ examId: null }, { examId: body.examId }] } : {}) },
      select: { id: true, title: true, difficulty: true, expectedSeconds: true, definition: true },
    });
    const pool = templates.map((t) => ({ id: t.id, title: t.title, difficulty: t.difficulty, expectedSeconds: t.expectedSeconds, def: t.definition as unknown as TemplateDef }));

    const maxCount = premium ? MAX_QUESTIONS : FREE_MAX_QUESTIONS;
    const count = Math.floor(num(body.count, 1, maxCount, 10));
    const mix: Partial<Record<Level, number>> = premium && body.mix && typeof body.mix === 'object'
      ? { EASY: num(body.mix.EASY, 0, 100, 0), MEDIUM: num(body.mix.MEDIUM, 0, 100, 0), HARD: num(body.mix.HARD, 0, 100, 0) }
      : DEFAULT_MIX;
    const result = composeTest(pool, {
      count, mix,
      marks: premium ? num(body.marks, 0.25, 10, 1) : 1,
      negativeMarks: premium ? num(body.negativeMarks, 0, 5, 0.25) : 0.25,
      durationMinutes: premium && body.durationMinutes ? Math.floor(num(body.durationMinutes, 1, 300, 30)) : null,
      seed: userId + ':' + Date.now(),
    });
    if (!result.ok) return NextResponse.json({ message: result.reason }, { status: 400 });

    const title = 'Practice set - ' + new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' });
    const test = await prisma.mockTest.create({
      data: {
        userId, title, source: 'PRACTICE', published: false, durationMinutes: result.durationMinutes,
        sections: { create: [{ name: 'Practice', order: 0, questions: { create: result.questions.map((q, i) => ({ order: i, text: q.text, options: q.options, correctIndex: q.correctIndex, marks: q.marks, negativeMarks: q.negativeMarks, explanation: q.explanation })) } }] },
      },
      include: { sections: { orderBy: { order: 'asc' }, include: { questions: { orderBy: { order: 'asc' } } } } },
    });

    const snapshot = snapshotFromTest(test as any);
    const startedAt = new Date();
    const attempt = await prisma.mockAttempt.create({
      data: { testId: test.id, userId, startedAt, expiresAt: new Date(expiresAtMs(snapshot, startedAt.getTime())), snapshot: snapshot as unknown as Prisma.InputJsonValue, answers: {} },
      select: { id: true },
    });
    return NextResponse.json({ attemptId: attempt.id, questions: result.questions.length, shortfall: result.shortfall, durationMinutes: result.durationMinutes }, { status: 201 });
  } catch (error) {
    console.error('Practice failed:', error);
    return NextResponse.json({ message: 'Could not create the practice set. Please try again.' }, { status: 500 });
  }
}
