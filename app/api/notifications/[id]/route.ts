import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateNotificationDates } from '@/features/jobs/validation';

interface Params { params: Promise<{ id: string }> }

export async function GET(request: Request, { params }: Params) {
  const { id } = await params;
  try {
    const notification = await prisma.notification.findUnique({
      where: { id },
      include: { organization: true, posts: { include: { qualification: true } }, categories: true, states: true },
    });
    if (!notification) return NextResponse.json({ message: 'Not found' }, { status: 404 });
    return NextResponse.json(notification);
  } catch (error) {
    console.error('Failed to fetch notification:', error);
    return NextResponse.json({ message: 'Failed to fetch notification' }, { status: 500 });
  }
}

const DATE_FIELDS = ['notificationDate', 'applicationStartDate', 'applicationEndDate', 'examDate'];

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { posts, categoryIds, stateIds, ...notificationData } = body;

    const dateError = validateNotificationDates(notificationData);
    if (dateError) {
      return NextResponse.json({ message: dateError }, { status: 400 });
    }

    // Convert empty-string dates to null, and valid date strings to Date objects
    for (const field of DATE_FIELDS) {
      if (notificationData[field] === '') {
        notificationData[field] = null;
      } else if (notificationData[field]) {
        notificationData[field] = new Date(notificationData[field]);
      }
    }

    const notification = await prisma.notification.update({
      where: { id },
      data: {
        ...notificationData,
        categories: categoryIds ? { set: categoryIds.map((cid: string) => ({ id: cid })) } : undefined,
        states: stateIds ? { set: stateIds.map((sid: string) => ({ id: sid })) } : undefined,
      },
      include: { posts: true, organization: true },
    });

    return NextResponse.json(notification);
  } catch (error) {
    console.error('Failed to update notification:', error);
    return NextResponse.json({ message: 'Failed to update notification' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Params) {
  const { id } = await params;
  try {
    await prisma.notification.delete({ where: { id } });
    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error('Failed to delete notification:', error);
    return NextResponse.json({ message: 'Failed to delete notification' }, { status: 500 });
  }
}
