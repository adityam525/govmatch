import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const results = await prisma.result.findMany({
    include: { notification: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(results);
}

export async function POST(request: Request) {
  const body = await request.json();
  const result = await prisma.result.create({ data: body });
  return NextResponse.json(result, { status: 201 });
}
