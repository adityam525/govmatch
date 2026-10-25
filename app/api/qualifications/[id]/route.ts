import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { bad, describeDbError, slugify, text } from '@/lib/lookup-api';
import { levelOf, resolveEducationTypes } from '@/lib/qualification-api';

interface Params { params: Promise<{ id: string }> }

export async function GET(request: Request, { params }: Params) {
  const { id } = await params;
  const q = await prisma.qualification.findUnique({
    where: { id },
    include: { categories: { select: { id: true } } },
  });
  if (!q) return NextResponse.json({ message: 'Not found' }, { status: 404 });
  return NextResponse.json({ id: q.id, name: q.name, slug: q.slug, level: q.level, categoryIds: q.categories.map((c) => c.id) });
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  try {
    const body = await request.json();
    const data: Record<string, unknown> = {};

    if ('name' in body) {
      const name = text(body.name, 120);
      if (!name) return bad('Enter the qualification name (up to 120 characters).');
      data.name = name;
    }
    if ('slug' in body) {
      const slug = slugify(String(body.slug ?? ''));
      if (!slug) return bad('The slug needs letters or numbers.');
      data.slug = slug;
    }
    if ('level' in body) {
      const level = levelOf(body.level);
      if (level === undefined) return bad('Choose a level from 1 to 12.');
      data.level = level;
    }
    if ('categoryIds' in body) {
      const types = await resolveEducationTypes(body);
      if ('error' in types) return bad(types.error);
      data.categories = { set: types.ids.map((typeId) => ({ id: typeId })) };
    }

    const updated = await prisma.qualification.update({ where: { id }, data: data as any });
    return NextResponse.json(updated);
  } catch (error) {
    return describeDbError(error, 'qualification');
  }
}

export async function DELETE(request: Request, { params }: Params) {
  const { id } = await params;
  try {
    const [branches, posts, educations, profiles] = await Promise.all([
      prisma.branch.count({ where: { qualificationId: id } }),
      prisma.post.count({ where: { OR: [{ qualificationId: id }, { qualifications: { some: { id } } }] } }),
      prisma.userEducation.count({ where: { qualificationId: id } }),
      prisma.userProfile.count({ where: { qualificationId: id } }),
    ]);
    const used = [
      branches && `${branches} branch${branches === 1 ? '' : 'es'}`,
      posts && `${posts} job post${posts === 1 ? '' : 's'}`,
      educations && `${educations} user education entr${educations === 1 ? 'y' : 'ies'}`,
      profiles && `${profiles} user profile${profiles === 1 ? '' : 's'}`,
    ].filter(Boolean);
    if (used.length > 0) {
      return NextResponse.json({ message: `This qualification is still used by ${used.join(', ')}, so it cannot be deleted.` }, { status: 409 });
    }
    await prisma.qualification.delete({ where: { id } });
    return NextResponse.json({ deleted: true });
  } catch (error) {
    return describeDbError(error, 'qualification');
  }
}
