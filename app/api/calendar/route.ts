import { NextResponse } from 'next/server';
import { loadCalendarEvents } from '@/lib/calendar-queries';
import { currentMonth, icsFor } from '@/lib/exam-calendar';
import { SITE_URL } from '@/lib/blog';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const month = url.searchParams.get('month') ?? currentMonth();
  try {
    const events = await loadCalendarEvents(month);
    if (!events) return NextResponse.json({ message: 'Use a month like 2026-11.' }, { status: 400 });
    if (url.searchParams.get('format') === 'ics') {
      return new Response(icsFor(events, SITE_URL), {
        headers: { 'Content-Type': 'text/calendar; charset=utf-8', 'Content-Disposition': 'attachment; filename="govmatch-exams-' + month + '.ics"' },
      });
    }
    return NextResponse.json({ events });
  } catch (error) {
    console.error('Calendar failed:', error);
    return NextResponse.json({ message: 'Could not load the calendar.' }, { status: 500 });
  }
}
