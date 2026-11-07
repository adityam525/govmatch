import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/admin-session';
import { cleanMeta, coerceDefinition } from '@/lib/qb/template-input';
import { validateTemplate } from '@/lib/qb/template';

const MAX = 100;
type Row = { index: number; title: string; status: 'created' | 'valid' | 'duplicate' | 'error'; messages: string[] };

export async function POST(request: Request) {
  if (!(await isAdminRequest())) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const body = await request.json().catch(() => null);
  const list = body && Array.isArray(body.templates) ? body.templates : null;
  if (!list || list.length === 0) return NextResponse.json({ message: 'Expected { "templates": [ ... ] } with at least one template.' }, { status: 400 });
  if (list.length > MAX) return NextResponse.json({ message: 'At most ' + MAX + ' templates per import.' }, { status: 400 });

  const dryRun = body.dryRun !== false;
  const publish = body.publish === true;
  const seen = new Set<string>();
  const results: Row[] = [];

  for (const [index, item] of list.entries()) {
    const title = typeof item?.title === 'string' ? item.title : 'Template ' + (index + 1);
    const row: Row = { index, title, status: 'error', messages: [] };
    results.push(row);
    try {
      let topicId = typeof item?.topicId === 'string' ? item.topicId : '';
      if (!topicId) {
        const t = await prisma.qbTopic.findFirst({ where: { name: String(item?.topic ?? ''), chapter: { name: String(item?.chapter ?? '') } }, select: { id: true } });
        if (!t) { row.messages.push('Topic not found: chapter "' + (item?.chapter ?? '') + '", topic "' + (item?.topic ?? '') + '".'); continue; }
        topicId = t.id;
      }
      const meta = cleanMeta({ ...item, topicId });
      if ('error' in meta) { row.messages.push(meta.error); continue; }
      const parsed = coerceDefinition(item?.definition);
      if ('error' in parsed) { row.messages.push(parsed.error); continue; }
      const report = validateTemplate(parsed.def);
      if (!report.ok) { row.messages.push(...report.errors.slice(0, 3)); continue; }
      if (seen.has(meta.meta.slug) || (await prisma.qbTemplate.findUnique({ where: { slug: meta.meta.slug }, select: { id: true } }))) {
        row.status = 'duplicate'; row.messages.push('A template with the address "' + meta.meta.slug + '" already exists.'); continue;
      }
      seen.add(meta.meta.slug);
      row.messages.push(...report.warnings);
      if (dryRun) { row.status = 'valid'; continue; }
      await prisma.qbTemplate.create({ data: { ...meta.meta, definition: parsed.def as unknown as Prisma.InputJsonValue, published: publish } });
      row.status = 'created';
    } catch (error) {
      console.error('qb import row failed', error);
      row.messages.push('Could not save this row (see the server log).');
    }
  }
  return NextResponse.json({ dryRun, results });
}
