import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Params { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json();
  const role = await prisma.role.update({ where: { id }, data: body });
  return NextResponse.json(role);
}

export async function DELETE(request: Request, { params }: Params) {
  const { id } = await params;
  await prisma.role.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
