import { NextResponse } from 'next/server';

export const slugify = (input: string) =>
  input.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

export const text = (value: unknown, max: number): string | null | undefined => {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  const t = String(value).trim();
  return t.length > max ? undefined : t;
};

export function httpUrl(value: unknown): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  const t = String(value).trim();
  // Uploaded and pasted images are web URLs; site-relative paths come from the logo scripts.
  if (t.startsWith('/')) return t;
  try {
    const u = new URL(t);
    return u.protocol === 'http:' || u.protocol === 'https:' ? t : undefined;
  } catch {
    return undefined;
  }
}

export const bad = (message: string) => NextResponse.json({ message }, { status: 400 });

// Turns a Prisma failure into something an admin can act on.
export function describeDbError(error: unknown, what: string): NextResponse {
  const code = (error as { code?: string })?.code;
  if (code === 'P2002') return NextResponse.json({ message: `Another ${what} already uses that name, code or slug.` }, { status: 409 });
  if (code === 'P2003' || code === 'P2014') {
    return NextResponse.json({ message: `This ${what} is still used by other records, so it cannot be deleted. Remove or change those first.` }, { status: 409 });
  }
  if (code === 'P2025') return NextResponse.json({ message: `That ${what} no longer exists.` }, { status: 404 });
  console.error(`Failed on ${what}:`, error);
  return NextResponse.json({ message: `Could not save the ${what}.` }, { status: 500 });
}
