import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Params { params: Promise<{ id: string }> }

export async function GET(request: Request, { params }: Params) {
  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id }, include: { qualification: true } });
  if (!post) return NextResponse.json({ message: 'Not found' }, { status: 404 });
  return NextResponse.json(post);
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json();
  const post = await prisma.post.update({
    where: { id },
    data: {
      ...body,
      vacancies: body.vacancies !== undefined ? Number(body.vacancies) : undefined,
      minAge: body.minAge !== undefined ? Number(body.minAge) : undefined,
      maxAge: body.maxAge !== undefined ? Number(body.maxAge) : undefined,
    },
  });
  return NextResponse.json(post);
}

export async function DELETE(request: Request, { params }: Params) {
  const { id } = await params;
  await prisma.post.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
