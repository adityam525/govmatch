import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name ?? '').trim();
    const email = String(body.email ?? '').trim();
    const subject = String(body.subject ?? '').trim();
    const category = String(body.category ?? 'General Inquiry').trim();
    const message = String(body.message ?? '').trim();

    if (!name || !email || !message) {
      return NextResponse.json({ message: 'Name, email, and message are required' }, { status: 400 });
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ message: 'Please enter a valid email address' }, { status: 400 });
    }
    if (name.length > 100 || subject.length > 200 || message.length > 5000) {
      return NextResponse.json({ message: 'One of the fields is too long' }, { status: 400 });
    }

    const created = await prisma.contactMessage.create({
      data: { name, email, subject: subject || null, category, message },
    });

    return NextResponse.json({ id: created.id }, { status: 201 });
  } catch (error) {
    console.error('Failed to save contact message:', error);
    return NextResponse.json({ message: 'Failed to send message' }, { status: 500 });
  }
}
