import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const roles = await prisma.role.findMany({ orderBy: { name: 'asc' } });
  return NextResponse.json(roles);
}

export async function POST(request: Request) {
  const body = await request.json();
  const role = await prisma.role.create({ data: body });
  return NextResponse.json(role, { status: 201 });
}
