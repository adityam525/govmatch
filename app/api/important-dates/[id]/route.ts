import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Params { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json();
  const date = await prisma.importantDate.update({
    where: { id },
    data: {
      ...body,
      date: body.date ? new Date(body.date) : undefined,
    },
  });
  return NextResponse.json(date);
}

export async function DELETE(request: Request, { params }: Params) {
  const { id } = await params;
  await prisma.importantDate.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
