import { NextResponse } from 'next/server';
import { createHash, randomBytes } from 'crypto';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';

const hits = new Map<string, number[]>();
const limited = (key: string) => {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < 3_600_000);
  recent.push(now); hits.set(key, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > 5;
};
const MESSAGE = 'If that email has an account, we have sent a link to reset the password.';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase().slice(0, 200) : '';
  const ip = (request.headers.get('x-forwarded-for') ?? 'unknown').split(',')[0].trim();
  if (!email || limited(ip) || limited(email)) return NextResponse.json({ message: MESSAGE });

  try {
    const user = await prisma.user.findFirst({ where: { email: { equals: email, mode: 'insensitive' } }, select: { id: true, email: true, passwordHash: true } });
    if (user && user.passwordHash) {
      const token = randomBytes(32).toString('hex');
      await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
      await prisma.passwordResetToken.create({ data: { userId: user.id, tokenHash: createHash('sha256').update(token).digest('hex'), expiresAt: new Date(Date.now() + 3_600_000) } });
      const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
      await sendEmail(user.email, 'Reset your GovMatch password', 'Use this link within one hour to set a new password:\n\n' + site + '/reset-password?token=' + token + '\n\nIf you did not ask for this, ignore this email.');
    }
  } catch (error) { console.error('Password reset request failed:', error); }
  return NextResponse.json({ message: MESSAGE });
}
