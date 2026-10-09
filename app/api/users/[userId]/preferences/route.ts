import { NextResponse } from 'next/server';
import { EmploymentType } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireSelf } from '@/lib/require-user';

interface Params { params: Promise<{ userId: string }> }

const VALID_TYPES = ['PERMANENT', 'CONTRACT', 'APPRENTICE', 'INTERNSHIP', 'TEMPORARY', 'DEPUTATION'];

export async function GET(request: Request, { params }: Params) {
  const { userId } = await params;
  const guard = await requireSelf(userId);
  if (!guard.ok) return guard.response;

  const profile = await prisma.userProfile.findUnique({
    where: { userId },
    select: { preferredEmploymentTypes: true, preferredRoles: { select: { id: true } } },
  });

  return NextResponse.json({
    preferredRoleIds: profile?.preferredRoles.map((r) => r.id) ?? [],
    preferredEmploymentTypes: profile?.preferredEmploymentTypes ?? [],
  });
}

export async function PUT(request: Request, { params }: Params) {
  const { userId } = await params;
  const guard = await requireSelf(userId);
  if (!guard.ok) return guard.response;

  try {
    const body = await request.json();
    const roleIds: string[] = Array.isArray(body.preferredRoleIds) ? body.preferredRoleIds : [];
    const types = (Array.isArray(body.preferredEmploymentTypes) ? body.preferredEmploymentTypes : [])
      .filter((t: string) => VALID_TYPES.includes(t)) as EmploymentType[];

    await prisma.userProfile.upsert({
      where: { userId },
      update: {
        preferredEmploymentTypes: types,
        preferredRoles: { set: roleIds.map((id) => ({ id })) },
      },
      create: {
        userId,
        preferredEmploymentTypes: types,
        preferredRoles: { connect: roleIds.map((id) => ({ id })) },
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Failed to save preferences:', error);
    return NextResponse.json({ message: 'Failed to save preferences' }, { status: 500 });
  }
}
