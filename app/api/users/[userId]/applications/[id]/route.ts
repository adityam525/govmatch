import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSelf } from '@/lib/require-user';

interface Params { params: Promise<{ userId: string; id: string }> }

const VALID_STATUSES = ['APPLIED', 'EXAM_SCHEDULED', 'RESULT_AWAITED', 'SELECTED', 'REJECTED'];

const isNotFound = (error: unknown) => (error as any)?.code === 'P2025';

export async function PATCH(request: Request, { params }: Params) {
  const { userId, id } = await params;
  const guard = await requireSelf(userId);
  if (!guard.ok) return guard.response;

  try {
    const { status } = await request.json();
    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
    }
    // Scoped by userId so a user can only modify their own application.
    const application = await prisma.application.update({
      where: { id, userId },
      data: { status },
    });
    return NextResponse.json(application);
  } catch (error) {
    if (isNotFound(error)) {
      return NextResponse.json({ message: 'Application not found' }, { status: 404 });
    }
    console.error('Failed to update application:', error);
    return NextResponse.json({ message: 'Failed to update application' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Params) {
  const { userId, id } = await params;
  const guard = await requireSelf(userId);
  if (!guard.ok) return guard.response;

  try {
    await prisma.application.delete({ where: { id, userId } });
    return NextResponse.json({ deleted: true });
  } catch (error) {
    if (isNotFound(error)) {
      return NextResponse.json({ message: 'Application not found' }, { status: 404 });
    }
    console.error('Failed to delete application:', error);
    return NextResponse.json({ message: 'Failed to delete application' }, { status: 500 });
  }
}
