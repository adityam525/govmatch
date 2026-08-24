import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const notificationId = searchParams.get('notificationId');

  const dates = await prisma.importantDate.findMany({
    where: notificationId ? { notificationId } : undefined,
    orderBy: { order: 'asc' },
  });
  return NextResponse.json(dates);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const date = await prisma.importantDate.create({
      data: {
        ...body,
        date: new Date(body.date),
      },
    });
    return NextResponse.json(date, { status: 201 });
  } catch (error) {
    console.error('Failed to create important date:', error);
    return NextResponse.json({ message: 'Failed to create important date' }, { status: 500 });
  }
}
