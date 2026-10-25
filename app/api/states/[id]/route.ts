import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { bad, describeDbError, httpUrl, text } from '@/lib/lookup-api';

interface Params { params: Promise<{ id: string }> }

export async function GET(request: Request, { params }: Params) {
  const { id } = await params;
  const state = await prisma.state.findUnique({ where: { id } });
  if (!state) return NextResponse.json({ message: 'Not found' }, { status: 404 });
  return NextResponse.json(state);
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  try {
    const body = await request.json();
    const data: Record<string, unknown> = {};

    if ('name' in body) {
      const name = text(body.name, 80);
      if (!name) return bad('Enter the state name (up to 80 characters).');
      data.name = name;
    }
    if ('code' in body) {
      const code = text(body.code, 6)?.toUpperCase();
      if (!code || !/^[A-Z]{2,6}$/.test(code)) return bad('The state code is 2 to 6 capital letters, for example BR.');
      data.code = code;
    }
    if ('logoUrl' in body) {
      const logoUrl = httpUrl(body.logoUrl);
      if (logoUrl === undefined) return bad('The logo must be an uploaded image or a full web address.');
      data.logoUrl = logoUrl;
    }

    const state = await prisma.state.update({ where: { id }, data });
    return NextResponse.json(state);
  } catch (error) {
    return describeDbError(error, 'state');
  }
}

export async function DELETE(request: Request, { params }: Params) {
  const { id } = await params;
  try {
    const state = await prisma.state.findUnique({ where: { id }, select: { code: true, _count: { select: { notifications: true } } } });
    if (!state) return NextResponse.json({ message: 'That state no longer exists.' }, { status: 404 });
    const profiles = await prisma.userProfile.count({
      where: { OR: [{ domicileStateCode: state.code }, { preferredStateCodes: { has: state.code } }] },
    });
    const posts = await prisma.post.count({ where: { domicileStateCode: state.code } });
    if (state._count.notifications + profiles + posts > 0) {
      return NextResponse.json(
        { message: `This state is used by ${state._count.notifications} job(s), ${posts} post rule(s) and ${profiles} user profile(s), so it cannot be deleted.` },
        { status: 409 },
      );
    }
    await prisma.state.delete({ where: { id } });
    return NextResponse.json({ deleted: true });
  } catch (error) {
    return describeDbError(error, 'state');
  }
}
