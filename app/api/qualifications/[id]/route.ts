import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Params { params: Promise<{ id: string }> }

export async function GET(request: Request, { params }: Params) {
  const { id } = await params;
  const qualification = await prisma.qualification.findUnique({ where: { id } });
  if (!qualification) return NextResponse.json({ message: 'Not found' }, { status: 404 });
  return NextResponse.json(qualification);
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json();
  const qualification = await prisma.qualification.update({ where: { id }, data: body });
  return NextResponse.json(qualification);
}

export async function DELETE(request: Request, { params }: Params) {
  const { id } = await params;
  await prisma.qualification.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
