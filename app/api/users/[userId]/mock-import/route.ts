import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSelf } from '@/lib/require-user';
import { isPremiumSubscription } from '@/lib/plan';
import { MAX_PAPER_BYTES, readPaper } from '@/lib/paper-reader';
import { stripMarks } from '@/lib/paper-text';
import { parseQuestions } from '@/lib/question-parser';

export const runtime = 'nodejs';

// Placeholder until Premium limits are decided: set to false to let every user import.
const REQUIRE_PREMIUM = true;

interface Params { params: Promise<{ userId: string }> }

export async function POST(request: Request, { params }: Params) {
  const { userId } = await params;
  const guard = await requireSelf(userId);
  if (!guard.ok) return guard.response;

  if (REQUIRE_PREMIUM) {
    const user = await prisma.user.findUnique({ where: { id: userId }, include: { subscription: true } });
    if (!isPremiumSubscription(user?.subscription)) {
      return NextResponse.json({ message: 'Importing a paper is a Premium feature.' }, { status: 403 });
    }
  }

  try {
    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File)) return NextResponse.json({ message: 'Choose a file to upload.' }, { status: 400 });
    if (file.size > MAX_PAPER_BYTES) return NextResponse.json({ message: 'The file is larger than 5 MB.' }, { status: 400 });

    const read = await readPaper(Buffer.from(await file.arrayBuffer()));
    if ('error' in read) return NextResponse.json({ message: read.error }, { status: 400 });

    const parsed = parseQuestions(read.text);
    return NextResponse.json({
      kind: read.kind,
      fileName: file.name,
      warnings: parsed.warnings,
      keyFound: parsed.keyFound,
      questions: parsed.questions.map((q) => ({
        ...q,
        text: stripMarks(q.text),
        options: q.options.map(stripMarks),
        explanation: stripMarks(q.explanation),
      })),
    });
  } catch (error) {
    console.error('Failed to read paper:', error);
    return NextResponse.json({ message: 'Could not read this file. Please try another.' }, { status: 500 });
  }
}
