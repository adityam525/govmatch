import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { bad, describeDbError, slugify, text } from '@/lib/lookup-api';

interface Params { params: Promise<{ id: string }> }

export async function GET(request: Request, { params }: Params) {
  const { id } = await params;
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) return NextResponse.json({ message: 'Not found' }, { status: 404 });
  return NextResponse.json(category);
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  try {
    const body = await request.json();
    const data: Record<string, unknown> = {};
    if ('name' in body) {
      const name = text(body.name, 80);
      if (!name) return bad('Enter the category name (up to 80 characters).');
      data.name = name;
    }
    if ('slug' in body) {
      const slug = slugify(String(body.slug ?? ''));
      if (!slug) return bad('The slug needs letters or numbers.');
      data.slug = slug;
    }
    const category = await prisma.category.update({ where: { id }, data });
    return NextResponse.json(category);
  } catch (error) {
    return describeDbError(error, 'category');
  }
}

export async function DELETE(request: Request, { params }: Params) {
  const { id } = await params;
  try {
    const orgs = await prisma.organization.count({ where: { categoryId: id } });
    if (orgs > 0) {
      return NextResponse.json({ message: `${orgs} organization${orgs === 1 ? '' : 's'} use this category. Move them first.` }, { status: 409 });
    }
    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ deleted: true });
  } catch (error) {
    return describeDbError(error, 'category');
  }
}
