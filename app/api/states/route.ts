import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { bad, describeDbError, httpUrl, text } from '@/lib/lookup-api';

export async function GET() {
  const states = await prisma.state.findMany({ orderBy: { name: 'asc' } });
  return NextResponse.json(states);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = text(body.name, 80);
    const code = text(body.code, 6)?.toUpperCase();
    if (!name) return bad('Enter the state name (up to 80 characters).');
    if (!code || !/^[A-Z]{2,6}$/.test(code)) return bad('The state code is 2 to 6 capital letters, for example BR.');

    const logoUrl = httpUrl(body.logoUrl);
    if (logoUrl === undefined) return bad('The logo must be an uploaded image or a full web address.');

    const created = await prisma.state.create({ data: { name, code, logoUrl } });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return describeDbError(error, 'state');
  }
}
