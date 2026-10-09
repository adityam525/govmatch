import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Params { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json();
  const updated = await prisma.contactMessage.update({
    where: { id },
    data: { resolved: !!body.resolved },
  });
  return NextResponse.json(updated);
}

export async function DELETE(request: Request, { params }: Params) {
  const { id } = await params;
  await prisma.contactMessage.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
