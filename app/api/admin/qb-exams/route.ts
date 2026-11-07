import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/admin-session';

export async function GET() {
  if (!(await isAdminRequest())) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const rows = await prisma.qbExam.findMany({ orderBy: [{ name: 'asc' }, { stage: 'asc' }], select: { id: true, name: true, stage: true, organizationId: true } });
  return NextResponse.json(rows);
}
