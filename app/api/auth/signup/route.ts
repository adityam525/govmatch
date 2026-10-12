import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { clientIp, rateLimit } from '@/lib/rate-limit';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  // 5 signups per hour per IP
  const limit = rateLimit(`signup:${clientIp(request)}`, 5, 60 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { message: 'Too many signup attempts. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } },
    );
  }

  try {
    const body = await request.json();
    const name = String(body.name ?? '').trim();
    const email = String(body.email ?? '').trim().toLowerCase();
    const password = String(body.password ?? '');
    const { dateOfBirth, gender, category, qualificationId, branchId, degreeName, yearOfPassing, percentage } = body;

    if (!email || !password || !name) {
      return NextResponse.json({ message: 'Name, email, and password are required' }, { status: 400 });
    }
    if (!EMAIL_RE.test(email) || email.length > 254) {
      return NextResponse.json({ message: 'Please enter a valid email address' }, { status: 400 });
    }
    if (name.length > 100) {
      return NextResponse.json({ message: 'Name is too long' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ message: 'Password must be at least 8 characters' }, { status: 400 });
    }
    // bcrypt only uses the first 72 bytes; reject longer input instead of silently truncating
    if (Buffer.byteLength(password, 'utf8') > 72) {
      return NextResponse.json({ message: 'Password is too long (max 72 characters)' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ message: 'An account with this email already exists' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const fields = [dateOfBirth, gender, category, qualificationId, branchId, degreeName, yearOfPassing, percentage];
    const filledCount = fields.filter((f) => f !== undefined && f !== null && f !== '').length;
    const profileStrength = Math.round((filledCount / fields.length) * 100);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        authProvider: 'EMAIL',
        role: 'ASPIRANT',
        isActive: true,
        profile: {
          create: {
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
            gender: gender || null,
            category: category || null,
            qualificationId: qualificationId || null,
            branchId: branchId || null,
            degreeName: degreeName || null,
            yearOfPassing: yearOfPassing ? Number(yearOfPassing) : null,
            percentage: percentage ? Number(percentage) : null,
            profileStrength,
          },
        },
      },
    });

    return NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
  } catch (error) {
    console.error('Signup failed:', error);
    return NextResponse.json({ message: 'Signup failed' }, { status: 500 });
  }
}
