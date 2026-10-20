import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Params { params: Promise<{ id: string }> }

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_DAYS = 3650;

const summary = {
  id: true,
  email: true,
  isActive: true,
  subscription: { select: { plan: true, status: true, expiresAt: true } },
} as const;

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

// Body may carry { isActive: boolean } and/or { plan: 'FREE' | 'PREMIUM', days?: number }.
// days of 0 or missing means Premium with no expiry.
export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  if (body.plan !== undefined && body.plan !== 'FREE' && body.plan !== 'PREMIUM') {
    return NextResponse.json({ message: 'plan must be FREE or PREMIUM' }, { status: 400 });
  }

  try {
    if (typeof body.isActive === 'boolean') {
      await prisma.user.update({ where: { id }, data: { isActive: body.isActive } });
    }

    if (body.plan === 'PREMIUM') {
      const days = Number(body.days);
      const expiresAt =
        Number.isFinite(days) && days > 0 ? new Date(Date.now() + Math.min(days, MAX_DAYS) * DAY_MS) : null;
      await prisma.subscription.upsert({
        where: { userId: id },
        update: { plan: 'PREMIUM', status: 'ACTIVE', expiresAt, startedAt: new Date() },
        create: { userId: id, plan: 'PREMIUM', status: 'ACTIVE', expiresAt },
      });
    } else if (body.plan === 'FREE') {
      await prisma.subscription.upsert({
        where: { userId: id },
        update: { plan: 'FREE', status: 'ACTIVE', expiresAt: null },
        create: { userId: id, plan: 'FREE', status: 'ACTIVE' },
      });
    }

    const user = await prisma.user.findUnique({ where: { id }, select: summary });
    if (!user) return NextResponse.json({ message: 'Not found' }, { status: 404 });
    return NextResponse.json(user);
  } catch (error) {
    if ((error as any)?.code === 'P2025') {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    console.error('Failed to update user:', error);
    return NextResponse.json({ message: 'Failed to update user' }, { status: 500 });
  }
}
