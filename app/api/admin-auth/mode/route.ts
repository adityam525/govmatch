import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Tells the login page whether to show the email field. Reveals nothing but a yes or no.
export async function GET() {
  try {
    return NextResponse.json({ accounts: (await prisma.adminAccount.count()) > 0 });
  } catch {
    return NextResponse.json({ accounts: false });
  }
}
