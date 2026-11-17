import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/admin-session';

export async function GET() {
  if (!(await isAdminRequest())) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const rows = await prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 200 });
  return NextResponse.json(rows);
}
