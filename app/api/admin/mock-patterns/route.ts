import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/admin-session';
import { validatePattern } from '@/lib/mock-pattern';

export async function GET() {
  if (!(await isAdminRequest())) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const rows = await prisma.mockPattern.findMany({ orderBy: { name: 'asc' }, include: { organization: { select: { id: true, name: true, shortName: true } } } });
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  if (!(await isAdminRequest())) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const result = validatePattern(await request.json().catch(() => null));
  if ('error' in result) return NextResponse.json({ message: result.error }, { status: 400 });
  const { data } = result;
  if (!(await prisma.organization.findUnique({ where: { id: data.organizationId }, select: { id: true } }))) {
    return NextResponse.json({ message: 'That organization no longer exists.' }, { status: 400 });
  }
  const created = await prisma.mockPattern.create({
    data: { name: data.name, organizationId: data.organizationId, totalMinutes: data.totalMinutes, sections: data.sections as unknown as Prisma.InputJsonValue },
    select: { id: true },
  });
  return NextResponse.json(created, { status: 201 });
}
