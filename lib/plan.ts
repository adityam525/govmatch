import { prisma } from '@/lib/prisma';

interface SubscriptionLike {
  plan: string;
  status: string;
  expiresAt: Date | string | null;
}

// Premium only counts while it is ACTIVE and not past its expiry date.
export function isPremiumSubscription(sub: SubscriptionLike | null | undefined, now: Date = new Date()): boolean {
  if (!sub) return false;
  if (sub.plan !== 'PREMIUM' || sub.status !== 'ACTIVE') return false;
  return !sub.expiresAt || new Date(sub.expiresAt) > now;
}

export async function isPremiumUser(userId: string): Promise<boolean> {
  const sub = await prisma.subscription.findUnique({
    where: { userId },
    select: { plan: true, status: true, expiresAt: true },
  });
  return isPremiumSubscription(sub);
}
