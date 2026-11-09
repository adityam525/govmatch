import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { readPostRules } from '@/lib/import/post-rules';

interface Params { params: Promise<{ id: string }> }

const RULE_KEYS = [
  'genderRestriction', 'minExperienceYears', 'requiredCertifications', 'domicileStateCode', 'minHeightCm', 'minChestCm',
  'pwdTypes', 'ageCutoffDate', 'minMarksPercent', 'minMarksByCategory', 'typingOptions', 'maxQualificationLevel',
  'shorthandWpm', 'minDrivingYears', 'relaxationRules',
] as const;

const bad = (message: string) => NextResponse.json({ message }, { status: 400 });
const age = (v: unknown) => {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 && n <= 100 && Math.round(n * 10) / 10 === n ? n : undefined;
};

export async function GET(request: Request, { params }: Params) {
  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id }, include: { qualification: true, branches: true, roles: true } });
  if (!post) return NextResponse.json({ message: 'Not found' }, { status: 404 });
  return NextResponse.json(post);
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') return bad('Send the fields to change.');
  const { branchIds, roleIds, ...postData } = body as Record<string, any>;

  const present = RULE_KEYS.filter((k) => k in postData);
  const ruleData: Record<string, unknown> = {};
  if (present.length > 0) {
    const input: Record<string, unknown> = {};
    for (const k of present) input[k] = postData[k];
    const { rules, errors } = readPostRules(input);
    if (errors.length > 0) return bad(errors[0]);
    if (rules.domicileStateCode && present.includes('domicileStateCode')) {
      if (!(await prisma.state.findUnique({ where: { code: rules.domicileStateCode }, select: { code: true } }))) return bad('Choose a valid state for the residents-only rule.');
    }
    const json = (v: unknown, empty: boolean) => (empty ? Prisma.JsonNull : (v as Prisma.InputJsonValue));
    const pick: Record<string, unknown> = {
      genderRestriction: rules.genderRestriction, minExperienceYears: rules.minExperienceYears, requiredCertifications: rules.requiredCertifications,
      domicileStateCode: rules.domicileStateCode, minHeightCm: rules.minHeightCm, minChestCm: rules.minChestCm, pwdTypes: rules.pwdTypes,
      ageCutoffDate: rules.ageCutoffDate, minMarksPercent: rules.minMarksPercent, maxQualificationLevel: rules.maxQualificationLevel,
      shorthandWpm: rules.shorthandWpm, minDrivingYears: rules.minDrivingYears,
      minMarksByCategory: json(rules.minMarksByCategory, Object.keys(rules.minMarksByCategory).length === 0),
      typingOptions: json(rules.typingOptions, rules.typingOptions.length === 0),
      relaxationRules: json(rules.relaxationRules, rules.relaxationRules.length === 0),
    };
    for (const k of present) ruleData[k] = pick[k];
    if (present.includes('relaxationRules')) ruleData.ageRelaxation = json(rules.ageRelaxation, rules.relaxationRules.length === 0);
  }
  for (const k of RULE_KEYS) delete postData[k];

  const minAge = 'minAge' in postData ? age(postData.minAge) : undefined;
  const maxAge = 'maxAge' in postData ? age(postData.maxAge) : undefined;
  if (minAge === undefined && 'minAge' in postData) return bad('Minimum age must be a number from 0 to 100 with at most one decimal.');
  if (maxAge === undefined && 'maxAge' in postData) return bad('Maximum age must be a number from 0 to 100 with at most one decimal.');
  if (minAge != null && maxAge != null && minAge > maxAge) return bad('Minimum age cannot be above maximum age.');
  if (postData.vacancies !== undefined && (!Number.isInteger(Number(postData.vacancies)) || Number(postData.vacancies) < 0)) return bad('Vacancies must be a whole number.');

  try {
    const post = await prisma.post.update({
      where: { id },
      data: {
        ...postData,
        ...ruleData,
        vacancies: postData.vacancies !== undefined ? Number(postData.vacancies) : undefined,
        minAge: 'minAge' in postData ? minAge : undefined,
        maxAge: 'maxAge' in postData ? maxAge : undefined,
        branches: Array.isArray(branchIds) ? { set: branchIds.map((b: string) => ({ id: b })) } : undefined,
        roles: Array.isArray(roleIds) ? { set: roleIds.map((r: string) => ({ id: r })) } : undefined,
      },
      include: { branches: true, roles: true },
    });
    return NextResponse.json(post);
  } catch (error) {
    console.error('Failed to update post:', error);
    return NextResponse.json({ message: 'Could not update the post.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Params) {
  const { id } = await params;
  await prisma.post.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
