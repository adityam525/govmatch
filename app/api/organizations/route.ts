import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const organizations = await prisma.organization.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(organizations);
  } catch (error) {
    console.error('Failed to fetch organizations:', error);
    return NextResponse.json({ message: 'Failed to fetch organizations' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const organization = await prisma.organization.create({ data: body });
    return NextResponse.json(organization, { status: 201 });
  } catch (error) {
    console.error('Failed to create organization:', error);
    return NextResponse.json({ message: 'Failed to create organization' }, { status: 500 });
  }
}
