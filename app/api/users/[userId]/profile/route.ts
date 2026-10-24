import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSelf } from '@/lib/require-user';
import { DISABILITY_CODES, SPECIAL_STATUS_CODES } from '@/lib/special-categories';

interface Params { params: Promise<{ userId: string }> }

const GENDERS = ['Male', 'Female', 'Other'];
const CATEGORIES = ['General', 'OBC', 'SC', 'ST', 'EWS'];
const FEMALE_ONLY_STATUSES = ['WIDOW', 'DIVORCED_WOMAN'];

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
    const existing = await prisma.userProfile.findUnique({ where: { userId } });

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

    if ('disabilityTypes' in body) {
      const types: unknown[] = Array.isArray(body.disabilityTypes) ? body.disabilityTypes : [];
      if (types.some((t) => typeof t !== 'string' || !DISABILITY_CODES.has(t))) {
        return NextResponse.json({ message: 'Choose a valid disability type.' }, { status: 400 });
      }
      data.disabilityTypes = [...new Set(types as string[])];
    }
    const effectiveTypes = (data.disabilityTypes as string[] | undefined) ?? existing?.disabilityTypes ?? [];
    if ('disabilityPercent' in body || 'disabilityTypes' in body) {
      if (effectiveTypes.length === 0 || body.disabilityPercent === '' || body.disabilityPercent == null) {
        data.disabilityPercent = null;
      } else {
        const percent = Number(body.disabilityPercent);
        if (!Number.isInteger(percent) || percent < 0 || percent > 100) {
          return NextResponse.json({ message: 'Disability percentage must be a whole number from 0 to 100.' }, { status: 400 });
        }
        data.disabilityPercent = percent;
      }
    }

    if ('specialStatuses' in body) {
      const statuses: unknown[] = Array.isArray(body.specialStatuses) ? body.specialStatuses : [];
      if (statuses.some((s) => typeof s !== 'string' || !SPECIAL_STATUS_CODES.has(s))) {
        return NextResponse.json({ message: 'Choose a valid status.' }, { status: 400 });
      }
      const gender = (data.gender as string | null | undefined) ?? existing?.gender ?? null;
      // Widow and divorced woman only apply to women; anything else is dropped.
      data.specialStatuses = [...new Set(statuses as string[])].filter(
        (s) => !FEMALE_ONLY_STATUSES.includes(s) || gender === 'Female',
      );
    }

    const profile = await prisma.userProfile.upsert({
      where: { userId },
      update: { ...data },
      create: { userId, ...data },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Failed to save profile:', error);
    return NextResponse.json({ message: 'Failed to save profile' }, { status: 500 });
  }
}
