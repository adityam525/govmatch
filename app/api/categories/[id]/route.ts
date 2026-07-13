import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Params { params: Promise<{ id: string }> }

export async function GET(request: Request, { params }: Params) {
  const { id } = await params;
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) return NextResponse.json({ message: 'Not found' }, { status: 404 });
  return NextResponse.json(category);
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json();
  const category = await prisma.category.update({ where: { id }, data: body });
  return NextResponse.json(category);
}

export async function DELETE(request: Request, { params }: Params) {
  const { id } = await params;
  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
