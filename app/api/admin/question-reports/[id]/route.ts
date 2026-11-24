import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/admin-session';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest())) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const b = await request.json().catch(() => ({}));
  if (!['OPEN', 'FIXED', 'DISMISSED'].includes(b.status)) return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
  const note = typeof b.adminNote === 'string' ? b.adminNote.slice(0, 500) : undefined;
  try {
    await prisma.questionReport.update({ where: { id }, data: { status: b.status, ...(note !== undefined ? { adminNote: note } : {}) } });
    return NextResponse.json({ id, status: b.status });
  } catch { return NextResponse.json({ message: 'That report no longer exists.' }, { status: 404 }); }
}
