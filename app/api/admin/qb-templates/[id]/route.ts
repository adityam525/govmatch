import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/admin-session';
import { describeDbError } from '@/lib/lookup-api';
import { cleanMeta, coerceDefinition } from '@/lib/qb/template-input';
import { validateTemplate, type TemplateDef } from '@/lib/qb/template';

interface Params { params: Promise<{ id: string }> }
const denied = () => NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
const gone = () => NextResponse.json({ message: 'That template no longer exists.' }, { status: 404 });

export async function GET(_req: Request, { params }: Params) {
  if (!(await isAdminRequest())) return denied();
  const { id } = await params;
  const row = await prisma.qbTemplate.findUnique({
    where: { id },
    include: { topic: { select: { id: true, chapterId: true, chapter: { select: { subjectId: true } } } } },
  });
  return row ? NextResponse.json(row) : gone();
}

export async function PUT(request: Request, { params }: Params) {
  if (!(await isAdminRequest())) return denied();
  const { id } = await params;
  try {
    const existing = await prisma.qbTemplate.findUnique({ where: { id }, select: { id: true, published: true } });
    if (!existing) return gone();
    const body = await request.json().catch(() => ({}));
    const meta = cleanMeta(body);
    if ('error' in meta) return NextResponse.json({ message: meta.error }, { status: 400 });
    const parsed = coerceDefinition(body.definition);
    if ('error' in parsed) return NextResponse.json({ message: parsed.error }, { status: 400 });
    if (!(await prisma.qbTopic.findUnique({ where: { id: meta.meta.topicId }, select: { id: true } }))) {
      return NextResponse.json({ message: 'That topic no longer exists.' }, { status: 400 });
    }
    const publish = typeof body.published === 'boolean' ? body.published : existing.published;
    if (publish) {
      const report = validateTemplate(parsed.def);
      if (!report.ok) return NextResponse.json({ message: 'Fix these before publishing: ' + report.errors[0], report }, { status: 400 });
    }
    const taken = await prisma.qbTemplate.findFirst({ where: { slug: meta.meta.slug, id: { not: id } }, select: { id: true } });
    if (taken) return NextResponse.json({ message: 'Another template already uses that address.' }, { status: 409 });
    await prisma.qbTemplate.update({ where: { id }, data: { ...meta.meta, definition: parsed.def as unknown as Prisma.InputJsonValue, published: publish } });
    return NextResponse.json({ id });
  } catch (error) {
    return describeDbError(error, 'template');
  }
}

export async function PATCH(request: Request, { params }: Params) {
  if (!(await isAdminRequest())) return denied();
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  if (typeof body.published !== 'boolean') return NextResponse.json({ message: 'published must be true or false' }, { status: 400 });
  const row = await prisma.qbTemplate.findUnique({ where: { id }, select: { definition: true } });
  if (!row) return gone();
  if (body.published) {
    const report = validateTemplate(row.definition as unknown as TemplateDef);
    if (!report.ok) return NextResponse.json({ message: 'Fix these before publishing: ' + report.errors[0], report }, { status: 400 });
  }
  await prisma.qbTemplate.update({ where: { id }, data: { published: body.published } });
  return NextResponse.json({ id, published: body.published });
}

export async function DELETE(_req: Request, { params }: Params) {
  if (!(await isAdminRequest())) return denied();
  const { id } = await params;
  if (!(await prisma.qbTemplate.findUnique({ where: { id }, select: { id: true } }))) return gone();
  await prisma.qbTemplate.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
