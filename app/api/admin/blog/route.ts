import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/admin-session';
import { cleanBlogInput, uniqueBlogSlug } from '@/lib/blog';
import { describeDbError } from '@/lib/lookup-api';

export async function GET() {
  if (!(await isAdminRequest())) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const posts = await prisma.blogPost.findMany({
    orderBy: { updatedAt: 'desc' },
    select: { id: true, slug: true, title: true, published: true, publishedAt: true, updatedAt: true, tags: true, readMinutes: true },
  });
  return NextResponse.json(posts);
}

export async function POST(request: Request) {
  if (!(await isAdminRequest())) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  try {
    const body = await request.json().catch(() => ({}));
    const result = cleanBlogInput(body);
    if ('error' in result) return NextResponse.json({ message: result.error }, { status: 400 });
    const { hasBody, slug, ...data } = result.data;

    const publish = body.published === true;
    if (publish && !hasBody) return NextResponse.json({ message: 'Write some content before publishing.' }, { status: 400 });

    const created = await prisma.blogPost.create({
      data: { ...data, slug: await uniqueBlogSlug(slug), published: publish, publishedAt: publish ? new Date() : null },
      select: { id: true, slug: true },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return describeDbError(error, 'blog post');
  }
}
