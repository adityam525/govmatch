import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/admin-session';
import { toSectionCreate, validateTest } from '@/lib/mock-test';

export async function GET() {
  if (!(await isAdminRequest())) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const tests = await prisma.mockTest.findMany({
    where: { userId: null },
    orderBy: { updatedAt: 'desc' },
    select: { id: true, title: true, published: true, durationMinutes: true, updatedAt: true, _count: { select: { attempts: true } }, sections: { select: { _count: { select: { questions: true } } } } },
  });
  return NextResponse.json(tests.map((t) => ({
    id: t.id, title: t.title, published: t.published, durationMinutes: t.durationMinutes, updatedAt: t.updatedAt,
    attempts: t._count.attempts, questionCount: t.sections.reduce((n, s) => n + s._count.questions, 0),
  })));
}

export async function POST(request: Request) {
  if (!(await isAdminRequest())) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  try {
    const body = await request.json().catch(() => null);
    const result = validateTest(body);
    if ('error' in result) return NextResponse.json({ message: result.error }, { status: 400 });
    const { data } = result;
    const created = await prisma.mockTest.create({
      data: {
        userId: null, source: 'ADMIN', published: body?.published === true,
        title: data.title, description: data.description, examStyle: data.examStyle, durationMinutes: data.durationMinutes,
        sections: { create: toSectionCreate(data.sections) },
      },
      select: { id: true },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Failed to create official mock test:', error);
    return NextResponse.json({ message: 'Could not save the test. Nothing was changed.' }, { status: 500 });
  }
}
