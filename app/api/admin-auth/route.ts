import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createHash, timingSafeEqual } from 'node:crypto';
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_TTL_SECONDS,
  createAdminSessionToken,
} from '@/lib/admin-token';
import { clientIp, rateLimit, resetRateLimit } from '@/lib/rate-limit';

// Constant-time comparison (hashing first makes both buffers the same length).
function safeEqual(a: string, b: string) {
  const ha = createHash('sha256').update(a).digest();
  const hb = createHash('sha256').update(b).digest();
  return timingSafeEqual(ha, hb);
}

export async function POST(request: Request) {
  const configured = process.env.ADMIN_PASSWORD;
  if (!configured) {
    return NextResponse.json({ message: 'Admin login is not configured' }, { status: 500 });
  }

  const key = `admin-login:${clientIp(request)}`;
  const limit = rateLimit(key, 5, 15 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { message: 'Too many attempts. Try again later.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } },
    );
  }

  let password = '';
  try {
    const body = await request.json();
    password = typeof body?.password === 'string' ? body.password : '';
  } catch {
    // fall through with empty password
  }

  if (!password || !safeEqual(password, configured)) {
    return NextResponse.json({ message: 'Incorrect password' }, { status: 401 });
  }

  const token = await createAdminSessionToken();
  if (!token) {
    return NextResponse.json({ message: 'Admin login is not configured' }, { status: 500 });
  }

  resetRateLimit(key);

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: ADMIN_SESSION_TTL_SECONDS,
    path: '/',
  });

  return NextResponse.json({ success: true });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
  return NextResponse.json({ success: true });
}
