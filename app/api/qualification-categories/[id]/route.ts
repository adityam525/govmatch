import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { bad, describeDbError, slugify, text } from '@/lib/lookup-api';

interface Params { params: Promise<{ id: string }> }

const select = { id: true, name: true, slug: true, order: true } as const;

export async function GET(request: Request, { params }: Params) {
  const { id } = await params;
  const item = await prisma.qualificationCategory.findUnique({ where: { id }, select });
  if (!item) return NextResponse.json({ message: 'Not found' }, { status: 404 });
  return NextResponse.json(item);
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  try {
    const body = await request.json();
    const data: Record<string, unknown> = {};
    if ('name' in body) {
      const name = text(body.name, 80);
      if (!name) return bad('Enter the education type name (up to 80 characters).');
      data.name = name;
    }
    if ('slug' in body) {
      const slug = slugify(String(body.slug ?? ''));
      if (!slug) return bad('The slug needs letters or numbers.');
      data.slug = slug;
    }
    if ('order' in body && body.order !== '' && body.order !== null) {
      const order = Number(body.order);
      if (!Number.isInteger(order) || order < 0 || order > 999) return bad('The order must be a whole number from 0 to 999.');
      data.order = order;
    }
    const updated = await prisma.qualificationCategory.update({ where: { id }, data, select });
    return NextResponse.json(updated);
  } catch (error) {
    return describeDbError(error, 'education type');
  }
}

export async function DELETE(request: Request, { params }: Params) {
  const { id } = await params;
  try {
    const count = await prisma.qualification.count({ where: { categories: { some: { id } } } });
    if (count > 0) {
      return NextResponse.json(
        { message: `${count} qualification${count === 1 ? '' : 's'} use this education type. Move them first, or they would disappear from the profile and filters.` },
        { status: 409 },
      );
    }
    await prisma.qualificationCategory.delete({ where: { id } });
    return NextResponse.json({ deleted: true });
  } catch (error) {
    return describeDbError(error, 'education type');
  }
}
