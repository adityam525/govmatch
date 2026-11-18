import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { verifyMobileToken } from '@/lib/mobile-token';

// The logged-in user's id, from the web session cookie or a mobile Bearer token.
export async function currentUserId(): Promise<string | null> {
  const bearer = (await headers()).get('authorization');
  if (bearer?.startsWith('Bearer ')) return verifyMobileToken(bearer.slice(7));
  const session = await auth();
  return ((session?.user as any)?.id as string | undefined) ?? null;
}
