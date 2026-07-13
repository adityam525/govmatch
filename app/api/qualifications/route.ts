import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const qualifications = await prisma.qualification.findMany({ orderBy: { level: 'asc' } });
  return NextResponse.json(qualifications);
}

export async function POST(request: Request) {
  const body = await request.json();
  const qualification = await prisma.qualification.create({ data: body });
  return NextResponse.json(qualification, { status: 201 });
}
