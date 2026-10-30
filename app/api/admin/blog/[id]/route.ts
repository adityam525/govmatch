import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/admin-session';
import { cleanBlogInput } from '@/lib/blog';
import { describeDbError } from '@/lib/lookup-api';

interface Params { params: Promise<{ id: string }> }
const denied = () => NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

export async function GET(_req: Request, { params }: Params) {
  if (!(await isAdminRequest())) return denied();
  const { id } = await params;
  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) return NextResponse.json({ message: 'Not found' }, { status: 404 });
  return NextResponse.json(post);
}

export async function PATCH(request: Request, { params }: Params) {
  if (!(await isAdminRequest())) return denied();
  const { id } = await params;
  try {
    const body = await request.json().catch(() => ({}));
    const existing = await prisma.blogPost.findUnique({ where: { id }, select: { id: true, content: true, published: true, publishedAt: true } });
    if (!existing) return NextResponse.json({ message: 'That post no longer exists.' }, { status: 404 });

    // Quick publish or unpublish from the list.
    if (Object.keys(body).length === 1 && typeof body.published === 'boolean') {
      if (body.published && !existing.content.replace(/<[^>]*>/g, '').trim() && !existing.content.includes('<img')) {
        return NextResponse.json({ message: 'Write some content before publishing.' }, { status: 400 });
      }
      const updated = await prisma.blogPost.update({
        where: { id },
        data: { published: body.published, publishedAt: body.published ? (existing.publishedAt ?? new Date()) : existing.publishedAt },
        select: { id: true, published: true },
      });
      return NextResponse.json(updated);
    }

    const result = cleanBlogInput(body);
    if ('error' in result) return NextResponse.json({ message: result.error }, { status: 400 });
    const { hasBody, ...data } = result.data;

    const publish = typeof body.published === 'boolean' ? body.published : existing.published;
    if (publish && !hasBody) return NextResponse.json({ message: 'Write some content before publishing.' }, { status: 400 });

    const taken = await prisma.blogPost.findFirst({ where: { slug: data.slug, id: { not: id } }, select: { id: true } });
    if (taken) return NextResponse.json({ message: 'Another post already uses that address. Change the address.' }, { status: 409 });

    let publishedAt = existing.publishedAt;
    if (publish && !publishedAt) publishedAt = new Date();
    if (typeof body.publishedAt === 'string' && body.publishedAt) {
      const d = new Date(body.publishedAt);
      if (Number.isNaN(d.getTime())) return NextResponse.json({ message: 'Enter a valid publish date.' }, { status: 400 });
      publishedAt = d;
    }

    const updated = await prisma.blogPost.update({ where: { id }, data: { ...data, published: publish, publishedAt }, select: { id: true, slug: true } });
    return NextResponse.json(updated);
  } catch (error) {
    return describeDbError(error, 'blog post');
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  if (!(await isAdminRequest())) return denied();
  const { id } = await params;
  try {
    await prisma.blogPost.delete({ where: { id } });
    return NextResponse.json({ deleted: true });
  } catch (error) {
    return describeDbError(error, 'blog post');
  }
}
