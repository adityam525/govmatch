import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Params { params: Promise<{ id: string }> }

export async function GET(request: Request, { params }: Params) {
  const { id } = await params;
  const record = await prisma.admitCard.findUnique({ where: { id } });
  if (!record) return NextResponse.json({ message: 'Not found' }, { status: 404 });
  return NextResponse.json(record);
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json();
  const record = await prisma.admitCard.update({ where: { id }, data: body });
  return NextResponse.json(record);
}

export async function DELETE(request: Request, { params }: Params) {
  const { id } = await params;
  await prisma.admitCard.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
