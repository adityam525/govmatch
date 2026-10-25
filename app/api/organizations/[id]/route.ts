import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { bad, describeDbError, httpUrl, slugify, text } from '@/lib/lookup-api';

interface Params { params: Promise<{ id: string }> }

export async function GET(request: Request, { params }: Params) {
  const { id } = await params;
  try {
    const organization = await prisma.organization.findUnique({ where: { id } });
    if (!organization) return NextResponse.json({ message: 'Not found' }, { status: 404 });
    return NextResponse.json(organization);
  } catch (error) {
    console.error('Failed to fetch organization:', error);
    return NextResponse.json({ message: 'Failed to fetch organization' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  try {
    const body = await request.json();
    const data: Record<string, unknown> = {};

    if ('name' in body) {
      const name = text(body.name, 200);
      if (!name) return bad('Enter the organization name (up to 200 characters).');
      data.name = name;
    }
    if ('shortName' in body) {
      const shortName = text(body.shortName, 40);
      if (!shortName) return bad('Enter a short name (up to 40 characters).');
      data.shortName = shortName;
    }
    if ('slug' in body) {
      const slug = slugify(String(body.slug ?? ''));
      if (!slug) return bad('The slug needs letters or numbers.');
      data.slug = slug;
    }
    if ('website' in body) {
      const website = httpUrl(body.website);
      if (website === undefined) return bad('The website must be a full web address starting with http:// or https://.');
      data.website = website;
    }
    if ('logoUrl' in body) {
      const logoUrl = httpUrl(body.logoUrl);
      if (logoUrl === undefined) return bad('The logo must be an uploaded image or a full web address.');
      data.logoUrl = logoUrl;
    }
    if ('categoryId' in body) {
      data.category = body.categoryId ? { connect: { id: String(body.categoryId) } } : { disconnect: true };
    }

    const organization = await prisma.organization.update({ where: { id }, data: data as any });
    return NextResponse.json(organization);
  } catch (error) {
    return describeDbError(error, 'organization');
  }
}

export async function DELETE(request: Request, { params }: Params) {
  const { id } = await params;
  try {
    const jobs = await prisma.notification.count({ where: { organizationId: id } });
    if (jobs > 0) {
      return NextResponse.json({ message: `This organization has ${jobs} job${jobs === 1 ? '' : 's'}. Delete or move them first.` }, { status: 409 });
    }
    await prisma.organization.delete({ where: { id } });
    return NextResponse.json({ deleted: true });
  } catch (error) {
    return describeDbError(error, 'organization');
  }
}
