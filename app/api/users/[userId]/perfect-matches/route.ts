import { NextResponse } from 'next/server';
import { requireSelf } from '@/lib/require-user';
import { countPerfectMatches } from '@/lib/perfect-matches';

interface Params { params: Promise<{ userId: string }> }

export async function GET(_req: Request, { params }: Params) {
  const { userId } = await params;
  const guard = await requireSelf(userId);
  if (!guard.ok) return guard.response;
  try {
    const result = await countPerfectMatches(userId);
    return NextResponse.json(result, { headers: { 'Cache-Control': 'private, max-age=60' } });
  } catch (error) {
    console.error('Perfect matches failed:', error);
    return NextResponse.json({ count: 0, profileComplete: false }, { status: 200 });
  }
}
