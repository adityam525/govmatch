import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { CERT_CODES } from '@/lib/eligibility-options';
import { DISABILITY_CODES, legacyRelaxationMap, parseRules } from '@/lib/special-categories';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const notificationId = searchParams.get('notificationId');

  const posts = await prisma.post.findMany({
    where: notificationId ? { notificationId } : undefined,
    include: { qualification: true, qualifications: true, qualificationRules: true, notification: true, branches: true, roles: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(posts);
}

const blank = (v: unknown) => v === '' || v === null || v === undefined;

// null = leave empty, undefined = not a whole number in range
function whole(v: unknown, min: number, max: number): number | null | undefined {
  if (blank(v)) return null;
  const n = Number(v);
  return Number.isInteger(n) && n >= min && n <= max ? n : undefined;
}

async function cleanRequirements(body: Record<string, unknown>) {
  const data: Record<string, unknown> = {};
  const fail = (message: string) => ({ error: message, data });

  const gender = blank(body.genderRestriction) ? null : String(body.genderRestriction);
  if (gender !== null && gender !== 'MALE' && gender !== 'FEMALE') return fail('Choose who the post is open to.');
  data.genderRestriction = gender;

  const experience = whole(body.minExperienceYears, 0, 50);
  if (experience === undefined) return fail('Minimum experience must be a whole number of years from 0 to 50.');
  data.minExperienceYears = experience;

  const height = whole(body.minHeightCm, 100, 230);
  if (height === undefined) return fail('Minimum height must be between 100 and 230 cm.');
  data.minHeightCm = height;

  const chest = whole(body.minChestCm, 50, 150);
  if (chest === undefined) return fail('Minimum chest must be between 50 and 150 cm.');
  data.minChestCm = chest;

  const certs = Array.isArray(body.requiredCertifications) ? body.requiredCertifications : [];
  if (certs.some((c) => typeof c !== 'string' || !CERT_CODES.has(c))) return fail('One of the required certificates is not valid.');
  data.requiredCertifications = [...new Set(certs as string[])];

  const pwd = Array.isArray(body.pwdTypes) ? body.pwdTypes : [];
  if (pwd.some((t) => typeof t !== 'string' || !DISABILITY_CODES.has(t))) return fail('One of the disability groups is not valid.');
  data.pwdTypes = [...new Set(pwd as string[])];

  if (!blank(body.domicileStateCode)) {
    const state = await prisma.state.findUnique({ where: { code: String(body.domicileStateCode) }, select: { code: true } });
    if (!state) return fail('Choose a valid state for the residents-only rule.');
    data.domicileStateCode = state.code;
  } else data.domicileStateCode = null;

  if (!blank(body.ageCutoffDate)) {
    const text = String(body.ageCutoffDate);
    const date = /^\d{4}-\d{2}-\d{2}$/.test(text) ? new Date(`${text}T00:00:00.000Z`) : null;
    if (!date || Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== text) {
      return fail('Enter a real date for "age as on".');
    }
    data.ageCutoffDate = date;
  } else data.ageCutoffDate = null;

  const { rules, errors } = parseRules(body.relaxationRules);
  if (errors.length > 0) return fail(errors[0]);
  if (rules.length > 0) {
    data.relaxationRules = rules as unknown as Prisma.InputJsonValue;
    data.ageRelaxation = legacyRelaxationMap(rules);
  }

  return { error: null, data };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      branchIds, roleIds, qualificationIds,
      genderRestriction, minExperienceYears, requiredCertifications, domicileStateCode,
      minHeightCm, minChestCm, pwdTypes, relaxationRules, ageCutoffDate, qualificationRules,
      ...postData
    } = body;

    const extras = await cleanRequirements({
      genderRestriction, minExperienceYears, requiredCertifications, domicileStateCode,
      minHeightCm, minChestCm, pwdTypes, relaxationRules, ageCutoffDate,
    });
    if (extras.error) return NextResponse.json({ message: extras.error }, { status: 400 });

    const rulesToCreate = Array.isArray(qualificationRules)
      ? qualificationRules
          .filter((r: any) => r && typeof r.qualificationId === 'string' && r.qualificationId)
          .map((r: any) => ({
            qualificationId: r.qualificationId as string,
            branchIds: Array.isArray(r.branchIds) ? (r.branchIds as unknown[]).filter((x): x is string => typeof x === 'string') : [],
          }))
      : [];

    const post = await prisma.post.create({
      data: {
        ...postData,
        ...extras.data,
        vacancies: Number(postData.vacancies) || 0,
        minAge: postData.minAge ? Number(postData.minAge) : null,
        maxAge: postData.maxAge ? Number(postData.maxAge) : null,
        branches: branchIds?.length ? { connect: branchIds.map((id: string) => ({ id })) } : undefined,
        roles: roleIds?.length ? { connect: roleIds.map((id: string) => ({ id })) } : undefined,
        qualifications: qualificationIds?.length ? { connect: qualificationIds.map((id: string) => ({ id })) } : undefined,
        qualificationRules: rulesToCreate.length ? { create: rulesToCreate } : undefined,
      },
      include: { branches: true, roles: true, qualifications: true },
    });
    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('Failed to create post:', error);
    return NextResponse.json({ message: 'Failed to create post' }, { status: 500 });
  }
}
