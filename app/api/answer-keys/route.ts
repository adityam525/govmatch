import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const answerKeys = await prisma.answerKey.findMany({
    include: { notification: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(answerKeys);
}

export async function POST(request: Request) {
  const body = await request.json();
  const answerKey = await prisma.answerKey.create({ data: body });
  return NextResponse.json(answerKey, { status: 201 });
}
