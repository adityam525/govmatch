import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Params { params: Promise<{ id: string }> }

export async function GET(request: Request, { params }: Params) {
  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id },
    include: { qualification: true, branches: true, roles: true },
  });
  if (!post) return NextResponse.json({ message: 'Not found' }, { status: 404 });
  return NextResponse.json(post);
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json();
  const { branchIds, roleIds, ...postData } = body;

  const post = await prisma.post.update({
    where: { id },
    data: {
      ...postData,
      vacancies: postData.vacancies !== undefined ? Number(postData.vacancies) : undefined,
      minAge: postData.minAge !== undefined ? Number(postData.minAge) : undefined,
      maxAge: postData.maxAge !== undefined ? Number(postData.maxAge) : undefined,
      branches: branchIds !== undefined ? { set: branchIds.map((id: string) => ({ id })) } : undefined,
      roles: roleIds !== undefined ? { set: roleIds.map((id: string) => ({ id })) } : undefined,
    },
    include: { branches: true, roles: true },
  });
  return NextResponse.json(post);
}

export async function DELETE(request: Request, { params }: Params) {
  const { id } = await params;
  await prisma.post.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
