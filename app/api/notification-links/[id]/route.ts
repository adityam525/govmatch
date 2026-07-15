import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Params { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json();
  const link = await prisma.notificationLink.update({ where: { id }, data: body });
  return NextResponse.json(link);
}

export async function DELETE(request: Request, { params }: Params) {
  const { id } = await params;
  await prisma.notificationLink.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
