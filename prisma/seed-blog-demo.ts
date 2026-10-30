import 'dotenv/config';
import { prisma } from '../lib/prisma';
import { cleanBlogInput } from '../lib/blog';

const clean = process.argv.includes('--clean');
const posts = [1, 2, 3, 4].map((n) => ({
  title: `[DEMO] How to prepare for a government exam, part ${n}`,
  slug: `demo-blog-${n}`,
  tags: n % 2 ? ['Exam tips', 'SSC'] : ['Guides'],
  content: `<h2>Start with the syllabus</h2><p>Read the official notice first. It lists every topic. <a href="https://example.com">A link</a>.</p><ul><li>Plan your weeks</li><li>Practise previous papers</li></ul><blockquote>Consistency beats cramming.</blockquote><script>alert(1)</script>`,
}));

async function main() {
  await prisma.blogPost.deleteMany({ where: { slug: { startsWith: 'demo-blog-' } } });
  if (clean) { console.log('Removed demo blog posts.'); return; }
  for (const p of posts) {
    const r = cleanBlogInput(p);
    if ('error' in r) throw new Error(r.error);
    const { hasBody, ...data } = r.data;
    await prisma.blogPost.create({ data: { ...data, published: true, publishedAt: new Date() } });
  }
  console.log('Created 4 demo posts. Remove with: npx tsx prisma/seed-blog-demo.ts --clean');
}
main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
