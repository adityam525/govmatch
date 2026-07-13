import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Params { params: Promise<{ userId: string; notificationId: string }> }

export async function DELETE(request: Request, { params }: Params) {
  const { userId, notificationId } = await params;
  try {
    await prisma.savedJob.delete({
      where: { userId_notificationId: { userId, notificationId } },
    });
    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error('Failed to unsave job:', error);
    return NextResponse.json({ message: 'Failed to unsave job' }, { status: 500 });
  }
}
