import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSelf } from '@/lib/require-user';
import { DISABILITY_CODES, SPECIAL_STATUS_CODES } from '@/lib/special-categories';
import { CERT_CODES } from '@/lib/eligibility-options';

interface Params { params: Promise<{ userId: string }> }

const GENDERS = ['Male', 'Female', 'Other'];
const CATEGORIES = ['General', 'OBC', 'SC', 'ST', 'EWS'];
const FEMALE_ONLY_STATUSES = ['WIDOW', 'DIVORCED_WOMAN'];

const bad = (message: string) => NextResponse.json({ message }, { status: 400 });

// null clears the value; undefined means the input is not a valid whole number in range.
function wholeNumber(value: unknown, min: number, max: number): number | null | undefined {
  if (value === '' || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isInteger(n) && n >= min && n <= max ? n : undefined;
}

export async function GET(request: Request, { params }: Params) {
  const { userId } = await params;
  const guard = await requireSelf(userId);
  if (!guard.ok) return guard.response;

  const profile = await prisma.userProfile.findUnique({ where: { userId } });
  return NextResponse.json(profile);
}

// Only the fields present in the request are changed.
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
          return bad('Enter a valid date of birth.');
        }
        data.dateOfBirth = date;
      } else data.dateOfBirth = null;
    }
    if ('gender' in body) {
      if (body.gender && !GENDERS.includes(body.gender)) return bad('Choose a valid gender.');
      data.gender = body.gender || null;
    }
    if ('category' in body) {
      if (body.category && !CATEGORIES.includes(body.category)) return bad('Choose a valid category.');
      data.category = body.category || null;
    }
    if ('phoneNumber' in body) {
      const digits = String(body.phoneNumber ?? '').replace(/\D/g, '');
      if (body.phoneNumber && (digits.length < 10 || digits.length > 13)) return bad('Enter a valid mobile number.');
      data.phoneNumber = body.phoneNumber ? String(body.phoneNumber).trim() : null;
    }

    if ('disabilityTypes' in body) {
      const types: unknown[] = Array.isArray(body.disabilityTypes) ? body.disabilityTypes : [];
      if (types.some((t) => typeof t !== 'string' || !DISABILITY_CODES.has(t))) return bad('Choose a valid disability type.');
      data.disabilityTypes = [...new Set(types as string[])];
    }
    const effectiveTypes = (data.disabilityTypes as string[] | undefined) ?? existing?.disabilityTypes ?? [];
    if ('disabilityPercent' in body || 'disabilityTypes' in body) {
      if (effectiveTypes.length === 0) data.disabilityPercent = null;
      else {
        const percent = wholeNumber(body.disabilityPercent, 0, 100);
        if (percent === undefined) return bad('Disability percentage must be a whole number from 0 to 100.');
        data.disabilityPercent = percent;
      }
    }

    if ('specialStatuses' in body) {
      const statuses: unknown[] = Array.isArray(body.specialStatuses) ? body.specialStatuses : [];
      if (statuses.some((s) => typeof s !== 'string' || !SPECIAL_STATUS_CODES.has(s))) return bad('Choose a valid status.');
      const gender = (data.gender as string | null | undefined) ?? existing?.gender ?? null;
      data.specialStatuses = [...new Set(statuses as string[])].filter(
        (s) => !FEMALE_ONLY_STATUSES.includes(s) || gender === 'Female',
      );
    }

    if ('experienceYears' in body) {
      const years = wholeNumber(body.experienceYears, 0, 50);
      if (years === undefined) return bad('Experience must be a whole number of years from 0 to 50.');
      data.experienceYears = years;
    }
    if ('heightCm' in body) {
      const height = wholeNumber(body.heightCm, 100, 230);
      if (height === undefined) return bad('Height must be between 100 and 230 cm.');
      data.heightCm = height;
    }
    if ('chestCm' in body) {
      const chest = wholeNumber(body.chestCm, 50, 150);
      if (chest === undefined) return bad('Chest must be between 50 and 150 cm.');
      data.chestCm = chest;
    }
    if ('certifications' in body) {
      const list: unknown[] = Array.isArray(body.certifications) ? body.certifications : [];
      if (list.some((c) => typeof c !== 'string' || !CERT_CODES.has(c))) return bad('Choose valid certificates.');
      data.certifications = [...new Set(list as string[])];
    }

    if ('domicileStateCode' in body || 'preferredStateCodes' in body) {
      const known = new Set((await prisma.state.findMany({ select: { code: true } })).map((s) => s.code));
      if ('domicileStateCode' in body) {
        if (body.domicileStateCode && !known.has(body.domicileStateCode)) return bad('Choose a valid home state.');
        data.domicileStateCode = body.domicileStateCode || null;
      }
      if ('preferredStateCodes' in body) {
        const list: unknown[] = Array.isArray(body.preferredStateCodes) ? body.preferredStateCodes : [];
        if (list.some((c) => typeof c !== 'string' || !known.has(c))) return bad('Choose valid states.');
        data.preferredStateCodes = [...new Set(list as string[])];
      }
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
