import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSelf } from '@/lib/require-user';
import { toSectionCreate, validateTest } from '@/lib/mock-test';

interface Params { params: Promise<{ userId: string; testId: string }> }

const notFound = () => NextResponse.json({ message: 'That test no longer exists.' }, { status: 404 });

export async function GET(_req: Request, { params }: Params) {
  const { userId, testId } = await params;
  const guard = await requireSelf(userId);
  if (!guard.ok) return guard.response;

  const test = await prisma.mockTest.findFirst({
    where: { id: testId, userId },
    include: { sections: { orderBy: { order: 'asc' }, include: { questions: { orderBy: { order: 'asc' } } } } },
  });
  return test ? NextResponse.json(test) : notFound();
}

// Replaces the whole test. Past attempts keep their own snapshot, so their results do not change.
export async function PUT(request: Request, { params }: Params) {
  const { userId, testId } = await params;
  const guard = await requireSelf(userId);
  if (!guard.ok) return guard.response;

  try {
    if (!(await prisma.mockTest.findFirst({ where: { id: testId, userId }, select: { id: true } }))) return notFound();
    const result = validateTest(await request.json().catch(() => null));
    if ('error' in result) return NextResponse.json({ message: result.error }, { status: 400 });
    const { data } = result;

    await prisma.$transaction([
      prisma.mockSection.deleteMany({ where: { testId } }),
      prisma.mockTest.update({
        where: { id: testId },
        data: {
          title: data.title, description: data.description, examStyle: data.examStyle, durationMinutes: data.durationMinutes,
          sections: { create: toSectionCreate(data.sections) },
        },
      }),
    ]);
    return NextResponse.json({ id: testId });
  } catch (error) {
    console.error('Failed to update mock test:', error);
    return NextResponse.json({ message: 'Could not save the test. Nothing was changed.' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const { userId, testId } = await params;
  const guard = await requireSelf(userId);
  if (!guard.ok) return guard.response;

  if (!(await prisma.mockTest.findFirst({ where: { id: testId, userId }, select: { id: true } }))) return notFound();
  await prisma.mockTest.delete({ where: { id: testId } });
  return NextResponse.json({ deleted: true });
}
