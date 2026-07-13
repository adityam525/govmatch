import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const states = await prisma.state.findMany({ orderBy: { name: 'asc' } });
  return NextResponse.json(states);
}

export async function POST(request: Request) {
  const body = await request.json();
  const state = await prisma.state.create({ data: body });
  return NextResponse.json(state, { status: 201 });
}
