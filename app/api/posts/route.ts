import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const notificationId = searchParams.get('notificationId');

  const posts = await prisma.post.findMany({
    where: notificationId ? { notificationId } : undefined,
    include: { qualification: true, notification: true, branches: true, roles: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(posts);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { branchIds, roleIds, ...postData } = body;

    const post = await prisma.post.create({
      data: {
        ...postData,
        vacancies: Number(postData.vacancies) || 0,
        minAge: postData.minAge ? Number(postData.minAge) : null,
        maxAge: postData.maxAge ? Number(postData.maxAge) : null,
        branches: branchIds?.length ? { connect: branchIds.map((id: string) => ({ id })) } : undefined,
        roles: roleIds?.length ? { connect: roleIds.map((id: string) => ({ id })) } : undefined,
      },
      include: { branches: true, roles: true },
    });
    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('Failed to create post:', error);
    return NextResponse.json({ message: 'Failed to create post' }, { status: 500 });
  }
}
