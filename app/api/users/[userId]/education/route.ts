import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSelf } from '@/lib/require-user';
import { fieldKey } from '@/lib/field-keys';

interface Params { params: Promise<{ userId: string }> }

const MAX_ROWS = 12;
const FIRST_YEAR = 1950;

async function listEducation(userId: string) {
  const rows = await prisma.userEducation.findMany({
    where: { userId },
    include: {
      qualification: { select: { id: true, name: true, slug: true, level: true, categories: { select: { slug: true, name: true } } } },
      branch: { select: { id: true, name: true } },
    },
  });
  return rows.sort(
    (a, b) =>
      b.qualification.level - a.qualification.level ||
      (b.yearOfPassing ?? 0) - (a.yearOfPassing ?? 0),
  );
}

export async function GET(request: Request, { params }: Params) {
  const { userId } = await params;
  const guard = await requireSelf(userId);
  if (!guard.ok) return guard.response;
  return NextResponse.json(await listEducation(userId));
}

interface CleanRow {
  userId: string;
  qualificationId: string;
  branchId: string | null;
  subject: string | null;
  institution: string | null;
  yearOfPassing: number | null;
  percentage: number | null;
}

// Replaces the whole list in one transaction, then keeps the profile's single-qualification
// summary fields (used by older screens) in step with the highest qualification.
export async function PUT(request: Request, { params }: Params) {
  const { userId } = await params;
  const guard = await requireSelf(userId);
  if (!guard.ok) return guard.response;

  const body = await request.json().catch(() => null);
  const items: unknown = body?.items;
  if (!Array.isArray(items)) {
    return NextResponse.json({ message: 'Expected a list of qualifications' }, { status: 400 });
  }
  if (items.length > MAX_ROWS) {
    return NextResponse.json({ message: `You can add up to ${MAX_ROWS} qualifications` }, { status: 400 });
  }

  const currentYear = new Date().getFullYear();
  const errors: string[] = [];
  const rows: CleanRow[] = [];

  items.forEach((raw, index) => {
    const n = index + 1;
    const item = (raw ?? {}) as Record<string, unknown>;
    const qualificationId = typeof item.qualificationId === 'string' ? item.qualificationId : '';
    if (!qualificationId) {
      errors.push(`Row ${n}: choose a qualification.`);
      return;
    }

    const subject = typeof item.subject === 'string' && item.subject.trim() ? item.subject.trim() : null;
    const institution = typeof item.institution === 'string' && item.institution.trim() ? item.institution.trim() : null;
    if (subject && subject.length > 100) errors.push(`Row ${n}: the subject is too long (max 100 characters).`);
    if (institution && institution.length > 150) errors.push(`Row ${n}: the institution name is too long (max 150 characters).`);

    let yearOfPassing: number | null = null;
    if (item.yearOfPassing !== undefined && item.yearOfPassing !== null && item.yearOfPassing !== '') {
      const year = Number(item.yearOfPassing);
      if (!Number.isInteger(year) || year < FIRST_YEAR || year > currentYear) {
        errors.push(`Row ${n}: the year of passing must be between ${FIRST_YEAR} and ${currentYear}.`);
      } else yearOfPassing = year;
    }

    let percentage: number | null = null;
    if (item.percentage !== undefined && item.percentage !== null && item.percentage !== '') {
      const value = Number(item.percentage);
      if (!Number.isFinite(value) || value < 0 || value > 100) {
        errors.push(`Row ${n}: marks must be a percentage between 0 and 100.`);
      } else percentage = Math.round(value * 100) / 100;
    }

    rows.push({
      userId,
      qualificationId,
      branchId: typeof item.branchId === 'string' && item.branchId ? item.branchId : null,
      subject,
      institution,
      yearOfPassing,
      percentage,
    });
  });

  if (errors.length > 0) {
    return NextResponse.json({ message: errors[0], errors }, { status: 400 });
  }

  const qualIds = [...new Set(rows.map((r) => r.qualificationId))];
  const branchIds = [...new Set(rows.map((r) => r.branchId).filter((id): id is string => !!id))];

  const [qualifications, branches, profile] = await Promise.all([
    prisma.qualification.findMany({ where: { id: { in: qualIds } }, select: { id: true, name: true, level: true } }),
    branchIds.length
      ? prisma.branch.findMany({ where: { id: { in: branchIds } }, select: { id: true, name: true, qualificationId: true } })
      : Promise.resolve([] as { id: string; name: string; qualificationId: string }[]),
    prisma.userProfile.findUnique({ where: { userId } }),
  ]);
  const qualById = new Map(qualifications.map((q) => [q.id, q]));
  const branchById = new Map(branches.map((b) => [b.id, b]));

  const seen = new Map<string, number>();
  rows.forEach((row, index) => {
    const n = index + 1;
    if (!qualById.has(row.qualificationId)) errors.push(`Row ${n}: that qualification no longer exists.`);
    if (row.branchId) {
      const branch = branchById.get(row.branchId);
      if (!branch) errors.push(`Row ${n}: that branch no longer exists.`);
      else if (branch.qualificationId !== row.qualificationId) errors.push(`Row ${n}: that branch does not belong to the chosen qualification.`);
    }
    const label = (row.branchId ? branchById.get(row.branchId)?.name : null) ?? row.subject;
    const key = `${row.qualificationId}|${fieldKey(label) ?? ''}|${row.yearOfPassing ?? ''}`;
    const earlier = seen.get(key);
    if (earlier !== undefined) errors.push(`Row ${n} repeats row ${earlier}.`);
    else seen.set(key, n);
  });
  if (errors.length > 0) {
    return NextResponse.json({ message: errors[0], errors }, { status: 400 });
  }

  // The highest qualification summarises the profile for older screens.
  const top = [...rows].sort(
    (a, b) =>
      (qualById.get(b.qualificationId)?.level ?? 0) - (qualById.get(a.qualificationId)?.level ?? 0) ||
      (b.yearOfPassing ?? 0) - (a.yearOfPassing ?? 0) ||
      (b.percentage ?? 0) - (a.percentage ?? 0),
  )[0];

  const summary = top
    ? {
        qualificationId: top.qualificationId,
        branchId: top.branchId,
        degreeName: (() => {
          const name = qualById.get(top.qualificationId)?.name ?? '';
          const field = (top.branchId ? branchById.get(top.branchId)?.name : null) ?? top.subject;
          return field ? `${name} - ${field}` : name;
        })(),
        yearOfPassing: top.yearOfPassing,
        percentage: top.percentage,
      }
    : { qualificationId: null, branchId: null, degreeName: null, yearOfPassing: null, percentage: null };

  const merged = {
    dateOfBirth: profile?.dateOfBirth ?? null,
    gender: profile?.gender ?? null,
    category: profile?.category ?? null,
    ...summary,
  };
  const strengthFields = ['dateOfBirth', 'gender', 'category', 'qualificationId', 'degreeName', 'yearOfPassing', 'percentage'] as const;
  const filled = strengthFields.filter((field) => merged[field] !== null && merged[field] !== undefined && merged[field] !== '');
  const profileStrength = Math.round((filled.length / strengthFields.length) * 100);

  try {
    await prisma.$transaction([
      prisma.userEducation.deleteMany({ where: { userId } }),
      prisma.userEducation.createMany({ data: rows }),
      prisma.userProfile.upsert({
        where: { userId },
        update: { ...summary, profileStrength },
        create: { userId, ...summary, profileStrength },
      }),
    ]);
  } catch (error) {
    console.error('Failed to save education:', error);
    return NextResponse.json({ message: 'Could not save your education. Nothing was changed.' }, { status: 500 });
  }

  return NextResponse.json(await listEducation(userId));
}
