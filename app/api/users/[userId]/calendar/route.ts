import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSelf } from '@/lib/require-user';
import { loadCalendarEvents } from '@/lib/calendar-queries';
import { currentMonth, icsFor } from '@/lib/exam-calendar';
import { SITE_URL } from '@/lib/blog';

export const dynamic = 'force-dynamic';
interface Params { params: Promise<{ userId: string }> }

// Dates of the jobs this user saved or applied to.
export async function GET(request: Request, { params }: Params) {
  const { userId } = await params;
  const guard = await requireSelf(userId);
  if (!guard.ok) return guard.response;
  const url = new URL(request.url);
  const month = url.searchParams.get('month') ?? currentMonth();
  try {
    const [saved, applied] = await Promise.all([
      prisma.savedJob.findMany({ where: { userId }, select: { notificationId: true } }),
      prisma.application.findMany({ where: { userId }, select: { notificationId: true } }),
    ]);
    const ids = [...new Set([...saved, ...applied].map((r) => r.notificationId))];
    const events = await loadCalendarEvents(month, ids);
    if (!events) return NextResponse.json({ message: 'Use a month like 2026-11.' }, { status: 400 });
    if (url.searchParams.get('format') === 'ics') {
      return new Response(icsFor(events, SITE_URL), {
        headers: { 'Content-Type': 'text/calendar; charset=utf-8', 'Content-Disposition': 'attachment; filename="my-exams-' + month + '.ics"' },
      });
    }
    return NextResponse.json({ events, jobs: ids.length });
  } catch (error) {
    console.error('Calendar failed:', error);
    return NextResponse.json({ message: 'Could not load your calendar.' }, { status: 500 });
  }
}
