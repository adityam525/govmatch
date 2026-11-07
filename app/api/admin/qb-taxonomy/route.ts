import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/admin-session';

export async function GET() {
  if (!(await isAdminRequest())) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const subjects = await prisma.qbSubject.findMany({
    orderBy: { order: 'asc' },
    select: {
      id: true, name: true,
      chapters: { orderBy: { order: 'asc' }, select: { id: true, name: true, topics: { orderBy: { order: 'asc' }, select: { id: true, name: true } } } },
    },
  });
  return NextResponse.json(subjects);
}
