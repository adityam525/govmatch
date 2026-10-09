import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

type GuardResult = { ok: true } | { ok: false; response: NextResponse };

// Allows the request only when the logged-in user is acting on their own id.
// 401 = not logged in, 403 = logged in as someone else.
export async function requireSelf(userId: string): Promise<GuardResult> {
  const session = await auth();
  const sessionUserId = (session?.user as any)?.id as string | undefined;

  if (!sessionUserId) {
    return { ok: false, response: NextResponse.json({ message: 'Unauthorized' }, { status: 401 }) };
  }
  if (sessionUserId !== userId) {
    return { ok: false, response: NextResponse.json({ message: 'Forbidden' }, { status: 403 }) };
  }
  return { ok: true };
}
