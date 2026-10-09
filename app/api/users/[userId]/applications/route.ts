import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSelf } from '@/lib/require-user';

interface Params { params: Promise<{ userId: string }> }

const VALID_STATUSES = ['APPLIED', 'EXAM_SCHEDULED', 'RESULT_AWAITED', 'SELECTED', 'REJECTED'];

export async function GET(request: Request, { params }: Params) {
  const { userId } = await params;
  const guard = await requireSelf(userId);
  if (!guard.ok) return guard.response;

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
  const guard = await requireSelf(userId);
  if (!guard.ok) return guard.response;

  try {
    const { notificationId, status } = await request.json();
    if (!notificationId) {
      return NextResponse.json({ message: 'notificationId is required' }, { status: 400 });
    }
    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
    }
    const application = await prisma.application.create({
      data: { userId, notificationId, status: status || 'APPLIED' },
    });
    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error('Failed to create application:', error);
    return NextResponse.json({ message: 'Already tracking this application or failed' }, { status: 400 });
  }
}
