import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      password,
      dateOfBirth,
      gender,
      category,
      qualificationId,
      degreeName,
      yearOfPassing,
      percentage,
    } = body;

    if (!email || !password || !name) {
      return NextResponse.json({ message: 'Name, email, and password are required' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ message: 'An account with this email already exists' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const fields = [dateOfBirth, gender, category, qualificationId, degreeName, yearOfPassing, percentage];
    const filledCount = fields.filter((f) => f !== undefined && f !== null && f !== '').length;
    const profileStrength = Math.round((filledCount / fields.length) * 100);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        authProvider: 'EMAIL',
        profile: {
          create: {
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
            gender: gender || null,
            category: category || null,
            qualificationId: qualificationId || null,
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
