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

// Body may carry { isActive: boolean } and/or { plan: 'FREE' | 'PREMIUM' }.
// For PREMIUM, either `expiresAt` (YYYY-MM-DD, valid through the end of that
// day in IST) or `days` (0 or missing means no expiry).
export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  if (body.plan !== undefined && body.plan !== 'FREE' && body.plan !== 'PREMIUM') {
    return NextResponse.json({ message: 'plan must be FREE or PREMIUM' }, { status: 400 });
  }

  let premiumExpiry: Date | null = null;
  if (body.plan === 'PREMIUM') {
    if (typeof body.expiresAt === 'string' && body.expiresAt) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(body.expiresAt)) {
        return NextResponse.json({ message: 'expiresAt must be a date like 2027-03-31' }, { status: 400 });
      }
      const date = new Date(`${body.expiresAt}T23:59:59+05:30`);
      if (Number.isNaN(date.getTime())) {
        return NextResponse.json({ message: 'That is not a real calendar date' }, { status: 400 });
      }
      if (date.getTime() <= Date.now()) {
        return NextResponse.json({ message: 'The expiry date must be in the future' }, { status: 400 });
      }
      if (date.getTime() - Date.now() > MAX_DAYS * DAY_MS) {
        return NextResponse.json({ message: 'The expiry date is too far away (max 10 years)' }, { status: 400 });
      }
      premiumExpiry = date;
    } else {
      const days = Number(body.days);
      premiumExpiry =
        Number.isFinite(days) && days > 0 ? new Date(Date.now() + Math.min(days, MAX_DAYS) * DAY_MS) : null;
    }
  }

  try {
    if (typeof body.isActive === 'boolean') {
      await prisma.user.update({ where: { id }, data: { isActive: body.isActive } });
    }

    if (body.plan === 'PREMIUM') {
      await prisma.subscription.upsert({
        where: { userId: id },
        update: { plan: 'PREMIUM', status: 'ACTIVE', expiresAt: premiumExpiry, startedAt: new Date() },
        create: { userId: id, plan: 'PREMIUM', status: 'ACTIVE', expiresAt: premiumExpiry },
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
