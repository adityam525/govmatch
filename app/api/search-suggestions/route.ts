import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Maps common search terms to the real keywords they should match against,
// so "Bank PO" surfaces any post titled "Probationary Officer" / "Management Trainee"
// under a banking organization, not just literal "Bank PO" text.
const SEARCH_ALIASES: Record<string, string[]> = {
  'bank po': ['probationary officer', 'management trainee', 'po'],
  'po': ['probationary officer', 'management trainee'],
  'clerk': ['clerk', 'office assistant'],
  'je': ['junior engineer'],
  'ae': ['assistant engineer'],
  'technician': ['technician'],
  'teacher': ['teacher', 'tgt', 'pgt'],
  'officer': ['officer'],
};

function expandQuery(q: string): string[] {
  const lower = q.toLowerCase().trim();
  const aliasMatches = SEARCH_ALIASES[lower] ?? [];
  return [lower, ...aliasMatches];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim() ?? '';

  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  const terms = expandQuery(q);

  const notifications = await prisma.notification.findMany({
    where: {
      status: 'LIVE',
      OR: terms.flatMap((term) => [
        { title: { contains: term, mode: 'insensitive' as const } },
        { organization: { name: { contains: term, mode: 'insensitive' as const } } },
        { organization: { shortName: { contains: term, mode: 'insensitive' as const } } },
        { posts: { some: { title: { contains: term, mode: 'insensitive' as const } } } },
      ]),
    },
    include: { organization: true, posts: true },
    take: 8,
  });

  const suggestions = notifications.map((n) => ({
    id: n.id,
    title: n.title,
    slug: n.slug,
    organization: n.organization?.name ?? '',
    type: 'notification' as const,
  }));

  return NextResponse.json(suggestions);
}
