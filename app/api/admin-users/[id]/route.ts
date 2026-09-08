import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Params { params: Promise<{ id: string }> }

export async function GET(request: Request, { params }: Params) {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      authProvider: true,
      createdAt: true,
      profile: true,
      subscription: true,
      savedJobs: { select: { id: true } },
      applications: { select: { id: true, status: true } },
    },
  });
  if (!user) return NextResponse.json({ message: 'Not found' }, { status: 404 });
  return NextResponse.json(user);
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json();
  const user = await prisma.user.update({
    where: { id },
    data: {
      isActive: body.isActive,
    },
    select: { id: true, email: true, isActive: true },
  });
  return NextResponse.json(user);
}
