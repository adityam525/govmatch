import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const notificationId = searchParams.get('notificationId');

  const faqs = await prisma.notificationFAQ.findMany({
    where: notificationId ? { notificationId } : undefined,
    orderBy: { order: 'asc' },
  });
  return NextResponse.json(faqs);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const faq = await prisma.notificationFAQ.create({ data: body });
    return NextResponse.json(faq, { status: 201 });
  } catch (error) {
    console.error('Failed to create FAQ:', error);
    return NextResponse.json({ message: 'Failed to create FAQ' }, { status: 500 });
  }
}
