import 'dotenv/config';
import type { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { validateTemplate } from '../lib/qb/template';
import { STARTERS } from './data/qb-starters';

const apply = process.argv.includes('--apply');
const publish = process.argv.includes('--publish');

async function main() {
  let made = 0, skipped = 0, missing = 0;
  for (const s of STARTERS) {
    if (await prisma.qbTemplate.findUnique({ where: { slug: s.slug }, select: { id: true } })) { skipped++; continue; }
    const topic = await prisma.qbTopic.findFirst({ where: { name: s.topic, chapter: { name: s.chapter } }, select: { id: true } });
    if (!topic) { missing++; console.log('No topic "' + s.topic + '" under "' + s.chapter + '". Run seed-qb.ts --apply first.'); continue; }
    const ok = validateTemplate(s.def).ok;
    console.log((apply ? 'creating' : 'would create') + ': ' + s.title + ' [' + s.difficulty + (ok && publish ? ', published' : ', draft') + ']');
    made++;
    if (apply) {
      await prisma.qbTemplate.create({
        data: { slug: s.slug, title: s.title, topicId: topic.id, difficulty: s.difficulty, expectedSeconds: s.seconds, definition: s.def as unknown as Prisma.InputJsonValue, published: ok && publish },
      });
    }
  }
  console.log('\n' + (apply ? 'Created' : 'Would create') + ': ' + made + '. Already there: ' + skipped + '. Missing topic: ' + missing + '.');
  if (!apply) console.log('Preview only. Add --apply to save as drafts, or --apply --publish to publish the ones that pass.');
}
main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
