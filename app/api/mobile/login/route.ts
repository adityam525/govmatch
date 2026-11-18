import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { rateLimit, resetRateLimit, clientIp } from '@/lib/rate-limit';
import { signMobileToken } from '@/lib/mobile-token';

const DUMMY_HASH = '$2b$12$53/JRDIzlRfglxfD5Sq/GeYZwXC1JZAe8M0bap5YhwrcyuLwrdvq2';
const BAD = () => NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase().slice(0, 200) : '';
  const password = typeof body.password === 'string' ? body.password.slice(0, 200) : '';
  if (!email || !password) return BAD();

  const ipKey = 'mobile-login-ip:' + clientIp(request);
  const mailKey = 'mobile-login:' + email;
  if (!rateLimit(ipKey, 30, 15 * 60 * 1000).allowed || !rateLimit(mailKey, 10, 15 * 60 * 1000).allowed) {
    return NextResponse.json({ message: 'Too many attempts. Try again later.' }, { status: 429 });
  }
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    const hash = user?.passwordHash ?? DUMMY_HASH;
    const ok = await bcrypt.compare(password, hash);
    if (!user || !user.passwordHash || !user.isActive || !ok) return BAD();
    const token = await signMobileToken(user.id);
    if (!token) return NextResponse.json({ message: 'Login is not configured' }, { status: 500 });
    resetRateLimit(mailKey);
    return NextResponse.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    console.error('Mobile login failed:', error);
    return NextResponse.json({ message: 'Could not log in. Please try again.' }, { status: 500 });
  }
}
