import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Params { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json();
  const branch = await prisma.branch.update({ where: { id }, data: body });
  return NextResponse.json(branch);
}

export async function DELETE(request: Request, { params }: Params) {
  const { id } = await params;
  await prisma.branch.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
