import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { bad, describeDbError, httpUrl, slugify, text } from '@/lib/lookup-api';

export async function GET() {
  try {
    const organizations = await prisma.organization.findMany({
      orderBy: { name: 'asc' },
      include: { category: true },
    });
    return NextResponse.json(organizations);
  } catch (error) {
    console.error('Failed to fetch organizations:', error);
    return NextResponse.json({ message: 'Failed to fetch organizations' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = text(body.name, 200);
    const shortName = text(body.shortName, 40);
    if (!name) return bad('Enter the organization name (up to 200 characters).');
    if (!shortName) return bad('Enter a short name (up to 40 characters).');

    const website = httpUrl(body.website);
    const logoUrl = httpUrl(body.logoUrl);
    if (website === undefined) return bad('The website must be a full web address starting with http:// or https://.');
    if (logoUrl === undefined) return bad('The logo must be an uploaded image or a full web address.');

    const slug = slugify(text(body.slug, 80) || shortName || name);
    if (!slug) return bad('The slug needs letters or numbers.');

    const data: Record<string, unknown> = { name, shortName, slug, website, logoUrl };
    if (body.categoryId) data.category = { connect: { id: String(body.categoryId) } };

    const created = await prisma.organization.create({ data: data as any });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return describeDbError(error, 'organization');
  }
}
