import 'dotenv/config';
import { prisma } from '../lib/prisma';
import { isFixed, validateFixed } from '../lib/qb/fixed';

const apply = process.argv.includes('--apply');
async function main() {
  const ga = await prisma.qbSubject.findFirst({ where: { name: 'General Awareness' }, select: { id: true } });
  const all = await prisma.qbTemplate.findMany({ where: { published: false, slug: { startsWith: 'fx-' } }, include: { topic: { select: { name: true, chapter: { select: { subjectId: true } } } } } });
  const hold = !process.argv.includes('--include-held');
  const drafts = all.filter((d) => !(hold && ga && d.topic.chapter.subjectId === ga.id));
  if (all.length !== drafts.length) console.log('Held back: ' + (all.length - drafts.length) + ' General Awareness drafts (check the facts, then use --include-held).');
  let ok = 0, bad = 0;
  for (const d of drafts) {
    const def: any = d.definition;
    const problems = isFixed(def) ? validateFixed(def.fixed) : ['Not a fixed question.'];
    if (problems.length) { bad++; console.log('SKIP ' + d.title + ': ' + problems.join(' ')); continue; }
    ok++;
    if (apply) await prisma.qbTemplate.update({ where: { id: d.id }, data: { published: true } });
    else console.log('Q: ' + def.fixed.text + '\n   A: ' + def.fixed.options[def.fixed.correctIndex] + '   [' + d.topic.name + ']');
  }
  console.log('\n' + (apply ? 'Published' : 'Would publish') + ': ' + ok + '. Skipped: ' + bad + '.');
  if (!apply) console.log('Read each question and answer above. Re-run with --apply only after you have.');
}
main().catch((e) => { console.error(e.message ?? e); process.exit(1); }).finally(() => prisma.$disconnect());
