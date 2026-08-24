import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Params { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json();
  const level = await prisma.examLevel.update({ where: { id }, data: body });
  return NextResponse.json(level);
}

export async function DELETE(request: Request, { params }: Params) {
  const { id } = await params;
  await prisma.examLevel.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
