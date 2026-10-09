import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSelf } from '@/lib/require-user';

interface Params { params: Promise<{ userId: string }> }

export async function GET(request: Request, { params }: Params) {
  const { userId } = await params;
  const guard = await requireSelf(userId);
  if (!guard.ok) return guard.response;

  const savedJobs = await prisma.savedJob.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  const notificationIds = savedJobs.map((sj) => sj.notificationId);
  const notifications = await prisma.notification.findMany({
    where: { id: { in: notificationIds } },
    include: { organization: true, posts: true },
  });

  return NextResponse.json(notifications);
}

export async function POST(request: Request, { params }: Params) {
  const { userId } = await params;
  const guard = await requireSelf(userId);
  if (!guard.ok) return guard.response;

  try {
    const { notificationId } = await request.json();
    if (!notificationId) {
      return NextResponse.json({ message: 'notificationId is required' }, { status: 400 });
    }
    const saved = await prisma.savedJob.create({
      data: { userId, notificationId },
    });
    return NextResponse.json(saved, { status: 201 });
  } catch (error) {
    console.error('Failed to save job:', error);
    return NextResponse.json({ message: 'Already saved or failed to save' }, { status: 400 });
  }
}
