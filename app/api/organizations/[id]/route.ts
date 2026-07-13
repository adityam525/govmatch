import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: Params) {
  const { id } = await params;
  try {
    const organization = await prisma.organization.findUnique({ where: { id } });
    if (!organization) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(organization);
  } catch (error) {
    console.error('Failed to fetch organization:', error);
    return NextResponse.json({ message: 'Failed to fetch organization' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  try {
    const body = await request.json();
    const organization = await prisma.organization.update({ where: { id }, data: body });
    return NextResponse.json(organization);
  } catch (error) {
    console.error('Failed to update organization:', error);
    return NextResponse.json({ message: 'Failed to update organization' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Params) {
  const { id } = await params;
  try {
    await prisma.organization.delete({ where: { id } });
    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error('Failed to delete organization:', error);
    return NextResponse.json({ message: 'Failed to delete organization' }, { status: 500 });
  }
}
