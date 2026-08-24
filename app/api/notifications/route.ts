import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateNotificationDates } from '@/features/jobs/validation';

const DATE_FIELDS = ['notificationDate', 'applicationStartDate', 'applicationEndDate', 'examDate'];

export async function GET() {
  try {
    const notifications = await prisma.notification.findMany({
      include: {
        organization: { include: { category: true } },
        posts: { include: { qualification: true } },
        links: { orderBy: { order: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return NextResponse.json({ message: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { posts, categoryIds, stateIds, links, ...notificationData } = body;

    const dateError = validateNotificationDates(notificationData);
    if (dateError) {
      return NextResponse.json({ message: dateError }, { status: 400 });
    }

    for (const field of DATE_FIELDS) {
      if (notificationData[field] === '' || notificationData[field] == null) {
        notificationData[field] = null;
      } else {
        notificationData[field] = new Date(notificationData[field]);
      }
    }

    const notification = await prisma.notification.create({
      data: {
        ...notificationData,
        totalVacancies: Array.isArray(posts)
          ? posts.reduce((sum: number, p: any) => sum + (Number(p.vacancies) || 0), 0)
          : 0,
        categories: categoryIds?.length ? { connect: categoryIds.map((id: string) => ({ id })) } : undefined,
        states: stateIds?.length ? { connect: stateIds.map((id: string) => ({ id })) } : undefined,
        posts: posts?.length
          ? {
              create: posts.map((p: any) => ({
                title: p.title,
                vacancies: Number(p.vacancies) || 0,
                qualificationId: p.qualificationId,
                minAge: p.minAge ? Number(p.minAge) : null,
                maxAge: p.maxAge ? Number(p.maxAge) : null,
                payScale: p.payScale || null,
              })),
            }
          : undefined,
        links: links?.length
          ? {
              create: links.map((l: any, i: number) => ({
                label: l.label,
                url: l.url,
                linkType: l.linkType || 'OTHER',
                order: i,
              })),
            }
          : undefined,
      },
      include: { posts: true, organization: { include: { category: true } }, links: true },
    });

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error('Failed to create notification:', error);
    return NextResponse.json({ message: 'Failed to create notification' }, { status: 500 });
  }
}
