import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/admin-session';
import { describeDbError } from '@/lib/lookup-api';
import { cleanMeta, coerceDefinition } from '@/lib/qb/template-input';
import { validateTemplate } from '@/lib/qb/template';

export async function GET() {
  if (!(await isAdminRequest())) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const rows = await prisma.qbTemplate.findMany({
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true, slug: true, title: true, difficulty: true, expectedSeconds: true, published: true, updatedAt: true,
      topic: { select: { id: true, name: true, chapter: { select: { name: true, subject: { select: { name: true } } } } } },
    },
  });
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  if (!(await isAdminRequest())) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  try {
    const body = await request.json().catch(() => ({}));
    const meta = cleanMeta(body);
    if ('error' in meta) return NextResponse.json({ message: meta.error }, { status: 400 });
    const parsed = coerceDefinition(body.definition);
    if ('error' in parsed) return NextResponse.json({ message: parsed.error }, { status: 400 });
    if (!(await prisma.qbTopic.findUnique({ where: { id: meta.meta.topicId }, select: { id: true } }))) {
      return NextResponse.json({ message: 'That topic no longer exists.' }, { status: 400 });
    }
    const publish = body.published === true;
    if (publish) {
      const report = validateTemplate(parsed.def);
      if (!report.ok) return NextResponse.json({ message: 'Fix these before publishing: ' + report.errors[0], report }, { status: 400 });
    }
    const created = await prisma.qbTemplate.create({
      data: { ...meta.meta, definition: parsed.def as unknown as Prisma.InputJsonValue, published: publish },
      select: { id: true, slug: true },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return describeDbError(error, 'template');
  }
}
