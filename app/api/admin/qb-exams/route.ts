import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/admin-session';
import { slugify } from '@/lib/lookup-api';

export async function GET() {
  if (!(await isAdminRequest())) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const rows = await prisma.qbExam.findMany({ orderBy: [{ name: 'asc' }, { stage: 'asc' }], select: { id: true, name: true, stage: true, organizationId: true } });
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  if (!(await isAdminRequest())) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const stage = typeof body.stage === 'string' && body.stage.trim() ? body.stage.trim() : null;
  const organizationId = typeof body.organizationId === 'string' && body.organizationId ? body.organizationId : null;
  if (!name || name.length > 100) return NextResponse.json({ message: 'Enter the exam name (up to 100 characters).' }, { status: 400 });
  const slug = slugify(name + (stage ? ' ' + stage : '')).slice(0, 100);
  if (!slug) return NextResponse.json({ message: 'The name needs letters or numbers.' }, { status: 400 });
  if (await prisma.qbExam.findUnique({ where: { slug }, select: { id: true } })) return NextResponse.json({ message: 'That exam and stage already exist.' }, { status: 409 });
  const created = await prisma.qbExam.create({ data: { name, stage, slug, organizationId }, select: { id: true, name: true, stage: true, organizationId: true } });
  return NextResponse.json(created, { status: 201 });
}
