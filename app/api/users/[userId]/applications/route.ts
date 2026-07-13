import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Params { params: Promise<{ userId: string }> }

export async function GET(request: Request, { params }: Params) {
  const { userId } = await params;
  const applications = await prisma.application.findMany({
    where: { userId },
    orderBy: { appliedAt: 'desc' },
  });

  const notificationIds = applications.map((a) => a.notificationId);
  const notifications = await prisma.notification.findMany({
    where: { id: { in: notificationIds } },
    include: { organization: true },
  });

  const merged = applications.map((app) => ({
    ...app,
    notification: notifications.find((n) => n.id === app.notificationId),
  }));

  return NextResponse.json(merged);
}

export async function POST(request: Request, { params }: Params) {
  const { userId } = await params;
  try {
    const { notificationId, status } = await request.json();
    const application = await prisma.application.create({
      data: { userId, notificationId, status: status || 'APPLIED' },
    });
    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error('Failed to create application:', error);
    return NextResponse.json({ message: 'Already tracking this application or failed' }, { status: 400 });
  }
}
