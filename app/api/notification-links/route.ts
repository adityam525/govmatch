import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const notificationId = searchParams.get('notificationId');

  const links = await prisma.notificationLink.findMany({
    where: notificationId ? { notificationId } : undefined,
    orderBy: { order: 'asc' },
  });
  return NextResponse.json(links);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const link = await prisma.notificationLink.create({ data: body });
    return NextResponse.json(link, { status: 201 });
  } catch (error) {
    console.error('Failed to create link:', error);
    return NextResponse.json({ message: 'Failed to create link' }, { status: 500 });
  }
}
