import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSelf } from '@/lib/require-user';

interface Params { params: Promise<{ userId: string }> }

const GENDERS = ['Male', 'Female', 'Other'];
const CATEGORIES = ['General', 'OBC', 'SC', 'ST', 'EWS'];

export async function GET(request: Request, { params }: Params) {
  const { userId } = await params;
  const guard = await requireSelf(userId);
  if (!guard.ok) return guard.response;

  const profile = await prisma.userProfile.findUnique({ where: { userId } });
  return NextResponse.json(profile);
}

// Only the fields present in the request are changed, so saving personal details never
// wipes the qualification summary that the education list keeps up to date.
export async function PATCH(request: Request, { params }: Params) {
  const { userId } = await params;
  const guard = await requireSelf(userId);
  if (!guard.ok) return guard.response;

  try {
    const body = await request.json();
    const data: Record<string, unknown> = {};

    if ('dateOfBirth' in body) {
      if (body.dateOfBirth) {
        const date = new Date(body.dateOfBirth);
        if (Number.isNaN(date.getTime()) || date.getTime() > Date.now() || date.getFullYear() < 1930) {
          return NextResponse.json({ message: 'Enter a valid date of birth.' }, { status: 400 });
        }
        data.dateOfBirth = date;
      } else data.dateOfBirth = null;
    }
    if ('gender' in body) {
      if (body.gender && !GENDERS.includes(body.gender)) return NextResponse.json({ message: 'Choose a valid gender.' }, { status: 400 });
      data.gender = body.gender || null;
    }
    if ('category' in body) {
      if (body.category && !CATEGORIES.includes(body.category)) return NextResponse.json({ message: 'Choose a valid category.' }, { status: 400 });
      data.category = body.category || null;
    }
    if ('phoneNumber' in body) {
      const digits = String(body.phoneNumber ?? '').replace(/\D/g, '');
      if (body.phoneNumber && (digits.length < 10 || digits.length > 13)) {
        return NextResponse.json({ message: 'Enter a valid mobile number.' }, { status: 400 });
      }
      data.phoneNumber = body.phoneNumber ? String(body.phoneNumber).trim() : null;
    }

    const existing = await prisma.userProfile.findUnique({ where: { userId } });
    const merged: Record<string, unknown> = {
      dateOfBirth: existing?.dateOfBirth ?? null,
      gender: existing?.gender ?? null,
      category: existing?.category ?? null,
      qualificationId: existing?.qualificationId ?? null,
      degreeName: existing?.degreeName ?? null,
      yearOfPassing: existing?.yearOfPassing ?? null,
      percentage: existing?.percentage ?? null,
      ...data,
    };
    const fields = ['dateOfBirth', 'gender', 'category', 'qualificationId', 'degreeName', 'yearOfPassing', 'percentage'];
    const filled = fields.filter((f) => merged[f] !== null && merged[f] !== undefined && merged[f] !== '');
    const profileStrength = Math.round((filled.length / fields.length) * 100);

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
