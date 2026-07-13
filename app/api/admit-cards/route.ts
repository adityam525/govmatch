import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const admitCards = await prisma.admitCard.findMany({
    include: { notification: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(admitCards);
}

export async function POST(request: Request) {
  const body = await request.json();
  const admitCard = await prisma.admitCard.create({ data: body });
  return NextResponse.json(admitCard, { status: 201 });
}
