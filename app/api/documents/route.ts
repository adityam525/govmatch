import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const documents = await prisma.document.findMany({
    include: { notification: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(documents);
}

export async function POST(request: Request) {
  const body = await request.json();
  const document = await prisma.document.create({ data: body });
  return NextResponse.json(document, { status: 201 });
}
