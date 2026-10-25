import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { bad, describeDbError, slugify, text } from '@/lib/lookup-api';
import { levelOf, resolveEducationTypes } from '@/lib/qualification-api';

// GET /api/qualifications?categorySlugs=engineering,medical filters by education type.
export async function GET(request: NextRequest) {
  const categorySlugs = request.nextUrl.searchParams.get('categorySlugs')?.split(',').filter(Boolean) ?? [];
  const qualifications = await prisma.qualification.findMany({
    where: categorySlugs.length > 0 ? { categories: { some: { slug: { in: categorySlugs } } } } : {},
    orderBy: { level: 'asc' },
    include: { categories: true },
  });
  return NextResponse.json(qualifications);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = text(body.name, 120);
    if (!name) return bad('Enter the qualification name (up to 120 characters).');
    const slug = slugify(text(body.slug, 80) || name);
    if (!slug) return bad('The slug needs letters or numbers.');
    const level = levelOf(body.level);
    if (level === undefined) return bad('Choose a level from 1 to 12. It decides which jobs this qualification is eligible for.');

    const types = await resolveEducationTypes(body);
    if ('error' in types) return bad(types.error);

    const created = await prisma.qualification.create({
      data: {
        name,
        slug,
        level,
        categories: types.ids.length ? { connect: types.ids.map((id) => ({ id })) } : undefined,
      },
      include: { categories: true },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return describeDbError(error, 'qualification');
  }
}
