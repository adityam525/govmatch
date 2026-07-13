import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const notificationId = searchParams.get('notificationId');

  const posts = await prisma.post.findMany({
    where: notificationId ? { notificationId } : undefined,
    include: { qualification: true, notification: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(posts);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const post = await prisma.post.create({
      data: {
        ...body,
        vacancies: Number(body.vacancies) || 0,
        minAge: body.minAge ? Number(body.minAge) : null,
        maxAge: body.maxAge ? Number(body.maxAge) : null,
      },
    });
    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('Failed to create post:', error);
    return NextResponse.json({ message: 'Failed to create post' }, { status: 500 });
  }
}
