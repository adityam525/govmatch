import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Params { params: Promise<{ id: string }> }

export async function GET(request: Request, { params }: Params) {
  const { id } = await params;
  const state = await prisma.state.findUnique({ where: { id } });
  if (!state) return NextResponse.json({ message: 'Not found' }, { status: 404 });
  return NextResponse.json(state);
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json();
  const state = await prisma.state.update({ where: { id }, data: body });
  return NextResponse.json(state);
}

export async function DELETE(request: Request, { params }: Params) {
  const { id } = await params;
  await prisma.state.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
