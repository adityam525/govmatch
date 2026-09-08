import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Params { params: Promise<{ userId: string }> }

export async function DELETE(request: Request, { params }: Params) {
  const { userId } = await params;
  try {
    await prisma.user.delete({ where: { id: userId } });
    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error('Failed to delete account:', error);
    return NextResponse.json({ message: 'Failed to delete account' }, { status: 500 });
  }
}
