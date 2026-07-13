import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Params { params: Promise<{ userId: string }> }

export async function GET(request: Request, { params }: Params) {
  const { userId } = await params;
  const profile = await prisma.userProfile.findUnique({ where: { userId } });
  return NextResponse.json(profile);
}

export async function PATCH(request: Request, { params }: Params) {
  const { userId } = await params;
  try {
    const body = await request.json();

    const data = {
      dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
      gender: body.gender || null,
      category: body.category || null,
      qualificationId: body.qualificationId || null,
      degreeName: body.degreeName || null,
      yearOfPassing: body.yearOfPassing ? Number(body.yearOfPassing) : null,
      percentage: body.percentage ? Number(body.percentage) : null,
    };

    const profileStrength = computeProfileStrength(data);

    const profile = await prisma.userProfile.upsert({
      where: { userId },
      update: { ...data, profileStrength },
      create: { userId, ...data, profileStrength },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Failed to save profile:', error);
    return NextResponse.json({ message: 'Failed to save profile' }, { status: 500 });
  }
}

function computeProfileStrength(data: Record<string, any>): number {
  const fields = ['dateOfBirth', 'gender', 'category', 'qualificationId', 'degreeName', 'yearOfPassing', 'percentage'];
  const filled = fields.filter((f) => data[f] !== undefined && data[f] !== null && data[f] !== '');
  return Math.round((filled.length / fields.length) * 100);
}
