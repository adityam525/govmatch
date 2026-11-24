import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/admin-session';

export async function GET(request: Request) {
  if (!(await isAdminRequest())) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const status = new URL(request.url).searchParams.get('status') ?? 'OPEN';
  const rows = await prisma.questionReport.findMany({ where: status === 'ALL' ? undefined : { status }, orderBy: { createdAt: 'desc' }, take: 200 });
  const counts = new Map<string, number>();
  for (const r of rows) if (r.templateId) counts.set(r.templateId, (counts.get(r.templateId) ?? 0) + 1);
  return NextResponse.json(rows.map((r) => ({ ...r, sameQuestionReports: r.templateId ? counts.get(r.templateId) ?? 1 : 1 })));
}
