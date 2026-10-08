import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, subject, category, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ message: 'Name, email, and message are required' }, { status: 400 });
    }

    const created = await prisma.contactMessage.create({
      data: {
        name,
        email,
        subject: subject || null,
        category: category || 'General Inquiry',
        message,
      },
    });

    return NextResponse.json({ id: created.id }, { status: 201 });
  } catch (error) {
    console.error('Failed to save contact message:', error);
    return NextResponse.json({ message: 'Failed to send message' }, { status: 500 });
  }
}
