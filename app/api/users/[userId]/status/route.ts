import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSelf } from '@/lib/require-user';

interface Params { params: Promise<{ userId: string }> }

export async function GET(request: Request, { params }: Params) {
  const { userId } = await params;
  const guard = await requireSelf(userId);
  if (!guard.ok) return guard.response;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
      isActive: true,
      subscription: { select: { plan: true, status: true, expiresAt: true } },
    },
  });
  if (!user) return NextResponse.json({ message: 'Not found' }, { status: 404 });
  return NextResponse.json(user);
}
