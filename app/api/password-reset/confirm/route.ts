import { NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/password';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const token = typeof body.token === 'string' ? body.token : '';
  const password = typeof body.password === 'string' ? body.password : '';
  if (password.length < 8 || password.length > 128) return NextResponse.json({ message: 'Password must be 8 to 128 characters.' }, { status: 400 });
  if (!/^[a-f0-9]{64}$/.test(token)) return NextResponse.json({ message: 'This link is not valid or has expired.' }, { status: 400 });
  try {
    const row = await prisma.passwordResetToken.findUnique({ where: { tokenHash: createHash('sha256').update(token).digest('hex') } });
    if (!row || row.expiresAt.getTime() < Date.now()) return NextResponse.json({ message: 'This link is not valid or has expired.' }, { status: 400 });
    await prisma.$transaction([
      prisma.user.update({ where: { id: row.userId }, data: { passwordHash: await hashPassword(password) } }),
      prisma.passwordResetToken.deleteMany({ where: { userId: row.userId } }),
    ]);
    return NextResponse.json({ message: 'Password changed. You can log in now.' });
  } catch (error) {
    console.error('Password reset failed:', error);
    return NextResponse.json({ message: 'Could not reset the password. Please try again.' }, { status: 500 });
  }
}
