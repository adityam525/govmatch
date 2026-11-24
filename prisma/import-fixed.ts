import 'dotenv/config';
import fs from 'fs';
import { createHash } from 'crypto';
import type { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { shuffleFixed, validateFixed, type FixedQuestion } from '../lib/qb/fixed';

interface Item extends FixedQuestion { chapter: string; topic: string; difficulty?: string; seconds?: number }
const apply = process.argv.includes('--apply');
const file = process.argv.find((a, i) => i > 1 && !a.startsWith('--'));

async function main() {
  if (!file) throw new Error('Usage: npx tsx prisma/import-fixed.ts questions.json [--apply]');
  const items: Item[] = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!Array.isArray(items)) throw new Error('The file must be a JSON list.');
  let ok = 0, bad = 0, dup = 0;
  for (const [n, it] of items.entries()) {
    const label = '#' + (n + 1) + ' ' + String(it?.text ?? '').slice(0, 50);
    const problems = validateFixed(it);
    if (/current affairs/i.test(it?.chapter ?? '')) problems.push('Current Affairs is not accepted: those facts go stale.');
    if (!['EASY', 'MEDIUM', 'HARD'].includes(it?.difficulty ?? 'MEDIUM')) problems.push('difficulty must be EASY, MEDIUM or HARD.');
    const chapter = it?.chapter ? await prisma.qbChapter.findFirst({ where: { name: it.chapter }, select: { id: true } }) : null;
    const topic = chapter ? await prisma.qbTopic.findFirst({ where: { name: it.topic, chapterId: chapter.id }, select: { id: true } }) : null;
    if (!topic) problems.push('No topic "' + it?.topic + '" in chapter "' + it?.chapter + '".');
    if (problems.length) { bad++; console.log('PROBLEM ' + label + '\n   ' + problems.join('\n   ')); continue; }
    const oldSlug = 'fx-' + createHash('sha1').update(it.text.trim().toLowerCase()).digest('hex').slice(0, 16);
    const slug = 'fx-' + createHash('sha1').update(it.text.trim().toLowerCase() + '|' + [...it.options].map((o) => String(o).trim().toLowerCase()).sort().join('|')).digest('hex').slice(0, 16);
    if (await prisma.qbTemplate.findFirst({ where: { slug: { in: [slug, oldSlug] } }, select: { id: true } })) { dup++; continue; }
    ok++;
    if (apply) {
      const q = shuffleFixed({ text: it.text.trim(), options: it.options.map((o) => o.trim()), correctIndex: it.correctIndex, explanation: it.explanation.trim(), source: it.source });
      await prisma.qbTemplate.create({ data: { slug, title: it.text.trim().slice(0, 80), topicId: topic!.id, difficulty: it.difficulty ?? 'MEDIUM', expectedSeconds: it.seconds ?? 40, definition: { fixed: q } as unknown as Prisma.InputJsonValue, published: false } });
    }
  }
  console.log('\n' + (apply ? 'Created as drafts' : 'Would create') + ': ' + ok + '. Rejected: ' + bad + '. Already there: ' + dup + '.');
  if (!apply) console.log('Preview only. Re-run with --apply.');
}
main().catch((e) => { console.error(e.message ?? e); process.exit(1); }).finally(() => prisma.$disconnect());
