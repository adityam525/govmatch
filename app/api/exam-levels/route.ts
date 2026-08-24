import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const notificationId = searchParams.get('notificationId');

  const levels = await prisma.examLevel.findMany({
    where: notificationId ? { notificationId } : undefined,
    orderBy: { order: 'asc' },
  });
  return NextResponse.json(levels);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const level = await prisma.examLevel.create({ data: body });
    return NextResponse.json(level, { status: 201 });
  } catch (error) {
    console.error('Failed to create exam level:', error);
    return NextResponse.json({ message: 'Failed to create exam level' }, { status: 500 });
  }
}
