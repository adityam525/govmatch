import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type GuardResult = { ok: true } | { ok: false; response: NextResponse };

// Allows the request only when the logged-in user is acting on their own id.
// 401 = not logged in, 403 = someone else's id or a deactivated account.
export async function requireSelf(
  userId: string,
  options: { allowInactive?: boolean } = {},
): Promise<GuardResult> {
  const session = await auth();
  const sessionUserId = (session?.user as any)?.id as string | undefined;

  if (!sessionUserId) {
    return { ok: false, response: NextResponse.json({ message: 'Unauthorized' }, { status: 401 }) };
  }
  if (sessionUserId !== userId) {
    return { ok: false, response: NextResponse.json({ message: 'Forbidden' }, { status: 403 }) };
  }

  const account = await prisma.user.findUnique({ where: { id: userId }, select: { isActive: true } });
  if (!account || (!account.isActive && !options.allowInactive)) {
    return { ok: false, response: NextResponse.json({ message: 'Account is not active' }, { status: 403 }) };
  }
  return { ok: true };
}
