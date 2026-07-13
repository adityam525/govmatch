import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Params { params: Promise<{ userId: string; id: string }> }

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  try {
    const { status } = await request.json();
    const application = await prisma.application.update({
      where: { id },
      data: { status },
    });
    return NextResponse.json(application);
  } catch (error) {
    console.error('Failed to update application:', error);
    return NextResponse.json({ message: 'Failed to update application' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Params) {
  const { id } = await params;
  try {
    await prisma.application.delete({ where: { id } });
    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error('Failed to delete application:', error);
    return NextResponse.json({ message: 'Failed to delete application' }, { status: 500 });
  }
}
