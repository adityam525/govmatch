import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Params { params: Promise<{ userId: string }> }

export async function GET(request: Request, { params }: Params) {
  const { userId } = await params;
  const savedJobs = await prisma.savedJob.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  // Fetch full notification details for each saved job
  const notificationIds = savedJobs.map((sj) => sj.notificationId);
  const notifications = await prisma.notification.findMany({
    where: { id: { in: notificationIds } },
    include: { organization: true, posts: true },
  });

  return NextResponse.json(notifications);
}

export async function POST(request: Request, { params }: Params) {
  const { userId } = await params;
  try {
    const { notificationId } = await request.json();
    const saved = await prisma.savedJob.create({
      data: { userId, notificationId },
    });
    return NextResponse.json(saved, { status: 201 });
  } catch (error) {
    console.error('Failed to save job:', error);
    return NextResponse.json({ message: 'Already saved or failed to save' }, { status: 400 });
  }
}
