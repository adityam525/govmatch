import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/admin-session';
import {
  KIND_CODES,
  LEGACY_COLUMN,
  classifyChange,
  dayAsUtcMidnight,
  istToDate,
} from '@/lib/schedule';

interface Params { params: Promise<{ id: string }> }

const MAX_EVENTS = 40;

export async function GET(request: Request, { params }: Params) {
  if (!(await isAdminRequest())) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const events = await prisma.scheduleEvent.findMany({
    where: { notificationId: id },
    include: { history: { orderBy: { createdAt: 'asc' } } },
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
  });
  return NextResponse.json(events);
}

interface Incoming {
  id?: string;
  kind: string;
  label: string;
  day: string;
  time: string;
  reason: string;
}

// Replaces the job's whole schedule. Existing events are matched by id, so their history is
// kept; a moved moment adds a history row, and events missing from the list are deleted.
export async function PUT(request: Request, { params }: Params) {
  if (!(await isAdminRequest())) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const { id } = await params;

  const body = await request.json().catch(() => null);
  const items: unknown = body?.events;
  if (!Array.isArray(items)) return NextResponse.json({ message: 'Expected a list of events.' }, { status: 400 });
  if (items.length > MAX_EVENTS) return NextResponse.json({ message: `At most ${MAX_EVENTS} events per job.` }, { status: 400 });

  const job = await prisma.notification.findUnique({ where: { id }, select: { id: true } });
  if (!job) return NextResponse.json({ message: 'Job not found.' }, { status: 404 });

  const existing = await prisma.scheduleEvent.findMany({ where: { notificationId: id } });
  const existingById = new Map(existing.map((e) => [e.id, e]));

  type Prepared = {
    incoming: Incoming;
    at: Date | null;
    timeKnown: boolean;
    order: number;
  };
  const prepared: Prepared[] = [];

  for (let i = 0; i < items.length; i++) {
    const n = i + 1;
    const raw = (items[i] ?? {}) as Record<string, unknown>;
    const incoming: Incoming = {
      id: typeof raw.id === 'string' && raw.id ? raw.id : undefined,
      kind: String(raw.kind ?? ''),
      label: String(raw.label ?? '').trim(),
      day: String(raw.day ?? '').trim(),
      time: String(raw.time ?? '').trim(),
      reason: String(raw.reason ?? '').trim().slice(0, 200),
    };

    if (!KIND_CODES.has(incoming.kind)) return NextResponse.json({ message: `Event ${n}: choose what it is.` }, { status: 400 });
    if (!incoming.label || incoming.label.length > 120) {
      return NextResponse.json({ message: `Event ${n}: enter a name (up to 120 characters).` }, { status: 400 });
    }
    if (incoming.id && !existingById.has(incoming.id)) {
      return NextResponse.json({ message: `Event ${n}: this event no longer exists. Reload the page.` }, { status: 409 });
    }

    let at: Date | null = null;
    let timeKnown = false;
    if (incoming.day) {
      at = istToDate(incoming.day, incoming.time || null);
      if (!at) return NextResponse.json({ message: `Event ${n}: enter a real date${incoming.time ? ' and a time like 17:30' : ''}.` }, { status: 400 });
      timeKnown = !!incoming.time;
    } else if (incoming.time) {
      return NextResponse.json({ message: `Event ${n}: a time needs a date.` }, { status: 400 });
    }
    prepared.push({ incoming, at, timeKnown, order: i });
  }

  const keepIds = new Set(prepared.map((p) => p.incoming.id).filter((v): v is string => !!v));
  const removeIds = existing.filter((e) => !keepIds.has(e.id)).map((e) => e.id);

  try {
    await prisma.$transaction(async (tx) => {
      if (removeIds.length > 0) await tx.scheduleEvent.deleteMany({ where: { id: { in: removeIds } } });

      for (const p of prepared) {
        const { incoming, at, timeKnown, order } = p;
        const before = incoming.id ? existingById.get(incoming.id) : undefined;

        if (!before) {
          await tx.scheduleEvent.create({
            data: {
              notificationId: id,
              kind: incoming.kind,
              label: incoming.label,
              at,
              timeKnown,
              order,
              history: { create: { kind: 'ANNOUNCED', newAt: at, newTimeKnown: timeKnown } },
            },
          });
          continue;
        }

        const kind = classifyChange(before.at, before.timeKnown, at, timeKnown);
        await tx.scheduleEvent.update({
          where: { id: before.id },
          data: {
            kind: incoming.kind,
            label: incoming.label,
            at,
            timeKnown,
            order,
            ...(kind
              ? {
                  history: {
                    create: {
                      kind,
                      oldAt: before.at,
                      oldTimeKnown: before.timeKnown,
                      newAt: at,
                      newTimeKnown: timeKnown,
                      reason: incoming.reason || null,
                    },
                  },
                }
              : {}),
          },
        });
      }

      // Keep the older date columns in step, so status, panels and filters keep working.
      const legacy: Record<string, Date | null> = {};
      for (const p of prepared) {
        const column = LEGACY_COLUMN[p.incoming.kind];
        if (column && legacy[column] === undefined) legacy[column] = p.at ? dayAsUtcMidnight(p.at) : null;
      }
      const firstExam = prepared.find((p) => p.incoming.kind === 'EXAM' && p.at);
      if (firstExam?.at) legacy.examDate = dayAsUtcMidnight(firstExam.at);
      if (Object.keys(legacy).length > 0) await tx.notification.update({ where: { id }, data: legacy });
    });
  } catch (error) {
    console.error('Failed to save schedule:', error);
    return NextResponse.json({ message: 'Could not save the schedule. Nothing was changed.' }, { status: 500 });
  }

  const events = await prisma.scheduleEvent.findMany({
    where: { notificationId: id },
    include: { history: { orderBy: { createdAt: 'asc' } } },
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
  });
  return NextResponse.json(events);
}
