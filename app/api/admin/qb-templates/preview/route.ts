import { NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-session';
import { coerceDefinition } from '@/lib/qb/template-input';
import { generate, validateTemplate } from '@/lib/qb/template';

// Checks a template without saving it: the 200-draw report plus a few fresh samples.
export async function POST(request: Request) {
  if (!(await isAdminRequest())) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const parsed = coerceDefinition(body.definition);
  if ('error' in parsed) return NextResponse.json({ message: parsed.error }, { status: 400 });
  const report = validateTemplate(parsed.def);
  const seed = typeof body.seed === 'string' && body.seed ? body.seed.slice(0, 40) : String(Date.now());
  const fresh = report.errors.length === 0 ? [0, 1, 2].map((i) => generate(parsed.def, 'preview-' + seed + '-' + i)).flatMap((g) => (g.ok ? [g.q] : [])) : [];
  return NextResponse.json({ report, fresh });
}
