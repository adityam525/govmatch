import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const notificationId = searchParams.get('notificationId');

  const fees = await prisma.applicationFee.findMany({
    where: notificationId ? { notificationId } : undefined,
    orderBy: { order: 'asc' },
  });
  return NextResponse.json(fees);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const fee = await prisma.applicationFee.create({ data: body });
    return NextResponse.json(fee, { status: 201 });
  } catch (error) {
    console.error('Failed to create application fee:', error);
    return NextResponse.json({ message: 'Failed to create application fee' }, { status: 500 });
  }
}
