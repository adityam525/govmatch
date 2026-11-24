import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { createHash, timingSafeEqual } from 'node:crypto';
import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_TTL_SECONDS, BOOTSTRAP_ADMIN_ID, createAdminSessionToken } from '@/lib/admin-token';
import { clientIp, rateLimit, resetRateLimit } from '@/lib/rate-limit';
import { prisma } from '@/lib/prisma';
import { afterFailure, isLocked, minutesLeft } from '@/lib/admin-lock';
import { audit } from '@/lib/audit';

const safeEqual = (a: string, b: string) => timingSafeEqual(createHash('sha256').update(a).digest(), createHash('sha256').update(b).digest());
// A real hash to compare against when the email is unknown, so timing does not reveal which emails exist.
const DUMMY_HASH = '$2b$12$C6UzMDM.H6dfI/f/IKcEeO5vYXn1Hn0VtXJ6O5N1rE3Rr4b5d1h5y';
const BAD = () => NextResponse.json({ message: 'Incorrect email or password' }, { status: 401 });

async function startSession(adminId: string) {
  const token = await createAdminSessionToken(adminId);
  if (!token) return NextResponse.json({ message: 'Admin login is not configured' }, { status: 500 });
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: ADMIN_SESSION_TTL_SECONDS, path: '/' });
  return NextResponse.json({ success: true });
}

export async function POST(request: Request) {
  const configured = process.env.ADMIN_PASSWORD;
  if (!configured) return NextResponse.json({ message: 'Admin login is not configured' }, { status: 500 });

  const key = `admin-login:${clientIp(request)}`;
  const limit = rateLimit(key, 10, 15 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json({ message: 'Too many attempts. Try again later.' }, { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } });
  }

  const body = await request.json().catch(() => ({}));
  const password = typeof body?.password === 'string' ? body.password : '';
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase().slice(0, 200) : '';
  if (!password) return BAD();

  try {
    const accounts = await prisma.adminAccount.count();

    // No accounts yet: the shared password still works, so nobody is locked out while setting up.
    if (accounts === 0) {
      if (!safeEqual(password, configured)) { await audit('login_failed', { request, detail: 'bootstrap password' }); return BAD(); }
      resetRateLimit(key);
      await audit('login', { request, adminId: BOOTSTRAP_ADMIN_ID, detail: 'bootstrap password' });
      return startSession(BOOTSTRAP_ADMIN_ID);
    }

    const account = email ? await prisma.adminAccount.findUnique({ where: { email } }) : null;
    if (!account || !account.isActive) {
      await bcrypt.compare(password, DUMMY_HASH);
      await audit('login_failed', { request, adminEmail: email || null, detail: 'unknown or inactive' });
      return BAD();
    }
    const now = Date.now();
    if (isLocked(account.lockedUntil, now)) {
      await audit('login_blocked', { request, adminId: account.id, adminEmail: account.email, detail: 'account locked' });
      return NextResponse.json({ message: 'This account is locked after too many wrong passwords. Try again in ' + minutesLeft(account.lockedUntil as Date, now) + ' minutes.' }, { status: 429 });
    }
    if (!(await bcrypt.compare(password, account.passwordHash))) {
      const next = afterFailure(account.failedAttempts, now);
      await prisma.adminAccount.update({ where: { id: account.id }, data: next });
      await audit(next.lockedUntil ? 'account_locked' : 'login_failed', { request, adminId: account.id, adminEmail: account.email });
      return BAD();
    }
    await prisma.adminAccount.update({ where: { id: account.id }, data: { failedAttempts: 0, lockedUntil: null, lastLoginAt: new Date() } });
    resetRateLimit(key);
    await audit('login', { request, adminId: account.id, adminEmail: account.email });
    return startSession(account.id);
  } catch (error) {
    console.error('Admin login failed:', error);
    return NextResponse.json({ message: 'Could not log in. Please try again.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  await audit('logout', { request });
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
  return NextResponse.json({ success: true });
}
