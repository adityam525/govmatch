import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/admin-session';

interface Params { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: Params) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  if (typeof body.published !== 'boolean') {
    return NextResponse.json({ message: 'published must be true or false' }, { status: 400 });
  }
  try {
    const job = await prisma.notification.update({
      where: { id },
      data: { published: body.published },
      select: { id: true, published: true },
    });
    return NextResponse.json(job);
  } catch (error) {
    if ((error as any)?.code === 'P2025') {
      return NextResponse.json({ message: 'Job not found' }, { status: 404 });
    }
    console.error('Failed to update publish state:', error);
    return NextResponse.json({ message: 'Failed to update' }, { status: 500 });
  }
}
