import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/admin-session';
import { toSectionCreate, validateTest } from '@/lib/mock-test';
import { resolveLink } from '@/lib/mock-link';

interface Params { params: Promise<{ id: string }> }
const denied = () => NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
const gone = () => NextResponse.json({ message: 'That test no longer exists.' }, { status: 404 });
const official = (id: string) => prisma.mockTest.findFirst({ where: { id, userId: null }, select: { id: true } });

export async function GET(_req: Request, { params }: Params) {
  if (!(await isAdminRequest())) return denied();
  const { id } = await params;
  const test = await prisma.mockTest.findFirst({
    where: { id, userId: null },
    include: { sections: { orderBy: { order: 'asc' }, include: { questions: { orderBy: { order: 'asc' } } } } },
  });
  return test ? NextResponse.json(test) : gone();
}

export async function PUT(request: Request, { params }: Params) {
  if (!(await isAdminRequest())) return denied();
  const { id } = await params;
  try {
    if (!(await official(id))) return gone();
    const result = validateTest(await request.json().catch(() => null));
    if ('error' in result) return NextResponse.json({ message: result.error }, { status: 400 });
    const { data } = result;
    await prisma.$transaction([
      prisma.mockSection.deleteMany({ where: { testId: id } }),
      prisma.mockTest.update({
        where: { id },
        data: { title: data.title, description: data.description, examStyle: data.examStyle, durationMinutes: data.durationMinutes, sections: { create: toSectionCreate(data.sections) } },
      }),
    ]);
    return NextResponse.json({ id });
  } catch (error) {
    console.error('Failed to update official mock test:', error);
    return NextResponse.json({ message: 'Could not save the test. Nothing was changed.' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: Params) {
  if (!(await isAdminRequest())) return denied();
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  if (!(await official(id))) return gone();
  const data: Record<string, unknown> = {};
  if ('published' in body) {
    if (typeof body.published !== 'boolean') return NextResponse.json({ message: 'published must be true or false' }, { status: 400 });
    data.published = body.published;
  }
  if ('notificationId' in body || 'examLevelId' in body) {
    const link = await resolveLink(body);
    if ('error' in link) return NextResponse.json({ message: link.error }, { status: 400 });
    data.notificationId = link.notificationId;
    data.examLevelId = link.examLevelId;
  }
  if (Object.keys(data).length === 0) return NextResponse.json({ message: 'Nothing to change.' }, { status: 400 });
  const updated = await prisma.mockTest.update({ where: { id }, data, select: { id: true, published: true } });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: Params) {
  if (!(await isAdminRequest())) return denied();
  const { id } = await params;
  if (!(await official(id))) return gone();
  await prisma.mockTest.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
