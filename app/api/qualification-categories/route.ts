import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { bad, describeDbError, slugify, text } from '@/lib/lookup-api';

export async function GET() {
  const categories = await prisma.qualificationCategory.findMany({
    orderBy: { order: 'asc' },
    select: { id: true, name: true, slug: true, order: true },
  });
  return NextResponse.json(categories);
}

// Slug is created from the name when empty; order goes after the current last one when empty.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = text(body.name, 80);
    if (!name) return bad('Enter the education type name (up to 80 characters).');
    const slug = slugify(text(body.slug, 80) || name);
    if (!slug) return bad('The slug needs letters or numbers.');

    let order: number;
    if (body.order === '' || body.order === null || body.order === undefined) {
      const last = await prisma.qualificationCategory.findFirst({ orderBy: { order: 'desc' }, select: { order: true } });
      order = (last?.order ?? 0) + 1;
    } else {
      order = Number(body.order);
      if (!Number.isInteger(order) || order < 0 || order > 999) return bad('The order must be a whole number from 0 to 999.');
    }

    const created = await prisma.qualificationCategory.create({
      data: { name, slug, order },
      select: { id: true, name: true, slug: true, order: true },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return describeDbError(error, 'education type');
  }
}
