import { NextResponse } from 'next/server';
import { requireSelf } from '@/lib/require-user';
import { loadMockHistory } from '@/lib/mock-history';
import { summarize } from '@/lib/mock-analytics';

interface Params { params: Promise<{ userId: string }> }

export async function GET(_req: Request, { params }: Params) {
  const { userId } = await params;
  const guard = await requireSelf(userId);
  if (!guard.ok) return guard.response;
  try {
    const { history, running } = await loadMockHistory(userId);
    return NextResponse.json({ history, running, summary: summarize(history) });
  } catch (error) {
    console.error('Failed to load mock history:', error);
    return NextResponse.json({ message: 'Could not load your results.' }, { status: 500 });
  }
}
