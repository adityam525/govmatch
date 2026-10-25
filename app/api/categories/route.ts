import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { bad, describeDbError, slugify, text } from '@/lib/lookup-api';

export async function GET() {
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
  return NextResponse.json(categories);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = text(body.name, 80);
    if (!name) return bad('Enter the category name (up to 80 characters).');
    const slug = slugify(text(body.slug, 80) || name);
    if (!slug) return bad('The slug needs letters or numbers.');
    const created = await prisma.category.create({ data: { name, slug } });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return describeDbError(error, 'category');
  }
}
