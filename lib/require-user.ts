import { NextResponse } from 'next/server';
import { currentUserId } from '@/lib/session-user';
import { prisma } from '@/lib/prisma';

type GuardResult = { ok: true } | { ok: false; response: NextResponse };

// Allows the request only when the logged-in user is acting on their own id.
// 401 = not logged in, 403 = someone else's id or a deactivated account.
export async function requireSelf(
  userId: string,
  options: { allowInactive?: boolean } = {},
): Promise<GuardResult> {
  const sessionUserId = (await currentUserId()) ?? undefined;

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
