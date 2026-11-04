import 'dotenv/config';
import { prisma } from '../lib/prisma';
import { QB_SUBJECTS } from './data/qb-taxonomy';
import { QB_EXAMS } from './data/qb-exams';

const apply = process.argv.includes('--apply');
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

async function main() {
  const known = new Set(QB_SUBJECTS.flatMap((s) => s.chapters.map((c) => c.name)));
  const typos = [...new Set(QB_EXAMS.flatMap((e) => e.chapters.filter((c) => !known.has(c))))];
  if (typos.length) { console.log('Chapter names in qb-exams.ts that are not in the taxonomy:', typos.join(' | ')); process.exit(1); }

  let subjects = 0, chapters = 0, topics = 0, exams = 0, links = 0;
  const chapterTopics = new Map<string, string[]>();

  for (const [si, subject] of QB_SUBJECTS.entries()) {
    let subj = await prisma.qbSubject.findUnique({ where: { slug: slugify(subject.name) } });
    if (!subj) { subjects++; if (apply) subj = await prisma.qbSubject.create({ data: { name: subject.name, slug: slugify(subject.name), order: si } }); }
    for (const [ci, chapter] of subject.chapters.entries()) {
      const cslug = slugify(chapter.name);
      let ch = subj ? await prisma.qbChapter.findUnique({ where: { subjectId_slug: { subjectId: subj.id, slug: cslug } } }) : null;
      if (!ch) { chapters++; if (apply && subj) ch = await prisma.qbChapter.create({ data: { subjectId: subj.id, name: chapter.name, slug: cslug, order: ci } }); }
      const ids: string[] = [];
      for (const [ti, topic] of chapter.topics.entries()) {
        const tslug = slugify(topic);
        let tp = ch ? await prisma.qbTopic.findUnique({ where: { chapterId_slug: { chapterId: ch.id, slug: tslug } } }) : null;
        if (!tp) { topics++; if (apply && ch) tp = await prisma.qbTopic.create({ data: { chapterId: ch.id, name: topic, slug: tslug, order: ti } }); }
        if (tp) ids.push(tp.id);
      }
      chapterTopics.set(chapter.name, ids);
    }
  }

  for (const def of QB_EXAMS) {
    const org = await prisma.organization.findFirst({ where: { shortName: { equals: def.org, mode: 'insensitive' } }, select: { id: true } });
    if (!org) console.log('No organization with short name "' + def.org + '" for ' + def.name + ' ' + def.stage + '. It will be created without one.');
    let exam = await prisma.qbExam.findUnique({ where: { slug: def.slug } });
    if (!exam) { exams++; if (apply) exam = await prisma.qbExam.create({ data: { slug: def.slug, name: def.name, stage: def.stage, organizationId: org?.id ?? null } }); }
    const topicIds = [...new Set(def.chapters.flatMap((c) => chapterTopics.get(c) ?? []))];
    if (apply && exam) {
      const res = await prisma.qbExamTopic.createMany({ data: topicIds.map((topicId) => ({ examId: exam!.id, topicId })), skipDuplicates: true });
      links += res.count;
    } else {
      links += def.chapters.reduce((n, c) => n + (QB_SUBJECTS.flatMap((s) => s.chapters).find((x) => x.name === c)?.topics.length ?? 0), 0);
    }
  }

  console.log((apply ? 'Created: ' : 'Would create: ') + subjects + ' subjects, ' + chapters + ' chapters, ' + topics + ' topics, ' + exams + ' exams, ' + links + ' exam-topic links.');
  if (!apply) console.log('Preview only. Re-run with --apply.');
}
main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
