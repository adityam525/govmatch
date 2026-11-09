import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/admin-session';

interface Params { params: Promise<{ id: string }> }

// The topic ids this exam's syllabus covers.
export async function GET(_req: Request, { params }: Params) {
  if (!(await isAdminRequest())) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const rows = await prisma.qbExamTopic.findMany({ where: { examId: id }, select: { topicId: true } });
  return NextResponse.json({ topicIds: rows.map((r) => r.topicId) });
}

// Replaces the syllabus with the given topic ids.
export async function PUT(request: Request, { params }: Params) {
  if (!(await isAdminRequest())) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const ids: string[] = Array.isArray(body.topicIds) ? [...new Set<string>(body.topicIds.filter((x: unknown): x is string => typeof x === 'string'))] : [];
  if (!(await prisma.qbExam.findUnique({ where: { id }, select: { id: true } }))) return NextResponse.json({ message: 'That exam no longer exists.' }, { status: 404 });
  const valid = await prisma.qbTopic.findMany({ where: { id: { in: ids } }, select: { id: true } });
  await prisma.$transaction([
    prisma.qbExamTopic.deleteMany({ where: { examId: id } }),
    prisma.qbExamTopic.createMany({ data: valid.map((t) => ({ examId: id, topicId: t.id })), skipDuplicates: true }),
  ]);
  return NextResponse.json({ saved: valid.length });
}

export async function DELETE(_req: Request, { params }: Params) {
  if (!(await isAdminRequest())) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  await prisma.qbExam.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ deleted: true });
}
