import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/admin-session';
import { validatePattern } from '@/lib/mock-pattern';

interface Params { params: Promise<{ id: string }> }
const denied = () => NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
const gone = () => NextResponse.json({ message: 'That pattern no longer exists.' }, { status: 404 });

export async function PUT(request: Request, { params }: Params) {
  if (!(await isAdminRequest())) return denied();
  const { id } = await params;
  if (!(await prisma.mockPattern.findUnique({ where: { id }, select: { id: true } }))) return gone();
  const result = validatePattern(await request.json().catch(() => null));
  if ('error' in result) return NextResponse.json({ message: result.error }, { status: 400 });
  const { data } = result;
  if (!(await prisma.organization.findUnique({ where: { id: data.organizationId }, select: { id: true } }))) {
    return NextResponse.json({ message: 'That organization no longer exists.' }, { status: 400 });
  }
  await prisma.mockPattern.update({
    where: { id },
    data: { name: data.name, organizationId: data.organizationId, totalMinutes: data.totalMinutes, sections: data.sections as unknown as Prisma.InputJsonValue },
  });
  return NextResponse.json({ id });
}

export async function DELETE(_req: Request, { params }: Params) {
  if (!(await isAdminRequest())) return denied();
  const { id } = await params;
  if (!(await prisma.mockPattern.findUnique({ where: { id }, select: { id: true } }))) return gone();
  await prisma.mockPattern.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
