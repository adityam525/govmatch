import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { currentUserId } from '@/lib/session-user';

export async function GET() {
  const id = await currentUserId();
  if (!id) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id }, select: { id: true, name: true, email: true, isActive: true } });
  if (!user || !user.isActive) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ user });
}
