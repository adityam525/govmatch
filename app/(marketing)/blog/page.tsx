import type { Metadata } from 'next';
import Link from 'next/link';
import BlogCard from '@/components/blog/BlogCard';
import { SITE_URL, getBlogPage, getBlogTags } from '@/lib/blog';

export const dynamic = 'force-dynamic';

interface Props { searchParams: Promise<{ [key: string]: string | undefined }> }

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { tag, page } = await searchParams;
  const qs = new URLSearchParams();
  if (tag) qs.set('tag', tag);
  if (page && page !== '1') qs.set('page', page);
  const title = tag ? `${tag} articles | GovMatch Blog` : 'Blog | GovMatch';
  const description = 'Guides, exam tips and updates on government jobs in India, from the GovMatch team.';
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/blog${qs.toString() ? `?${qs}` : ''}` },
    openGraph: { title, description, type: 'website', url: `${SITE_URL}/blog` },
  };
}

export default async function BlogListPage({ searchParams }: Props) {
  const { tag, page: pageParam } = await searchParams;
  const page = Math.max(1, Number.parseInt(pageParam ?? '1', 10) || 1);
  const [{ posts, pages, total }, tags] = await Promise.all([getBlogPage(page, tag), getBlogTags()]);

  const href = (p: number) => {
    const qs = new URLSearchParams();
    if (tag) qs.set('tag', tag);
    if (p > 1) qs.set('page', String(p));
    return `/blog${qs.toString() ? `?${qs}` : ''}`;
  };
  const chip = (on: boolean) =>
    `shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium ${on ? 'border-primary-600 bg-primary-600 text-white' : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'}`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">GovMatch Blog</h1>
        <p className="mt-2 max-w-2xl text-sm text-neutral-600 sm:text-base">Guides, exam tips and updates on government jobs in India.</p>
      </header>

      {tags.length > 0 && (
        <nav aria-label="Topics" className="mb-6 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Link href="/blog" className={chip(!tag)}>All</Link>
          {tags.map((t) => (
            <Link key={t.tag} href={`/blog?tag=${encodeURIComponent(t.tag)}`} className={chip(tag === t.tag)}>
              {t.tag} <span className="opacity-60">({t.count})</span>
            </Link>
          ))}
        </nav>
      )}

      {posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-white py-16 text-center text-sm text-neutral-600">
          {total === 0 && !tag ? 'No articles yet. Check back soon.' : 'No articles found for this topic.'}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => <BlogCard key={post.id} post={post} />)}
        </div>
      )}

      {pages > 1 && (
        <nav aria-label="Pages" className="mt-8 flex items-center justify-center gap-3 text-sm">
          {page > 1 && <Link href={href(page - 1)} rel="prev" className="rounded-lg border border-neutral-200 bg-white px-4 py-2 hover:bg-neutral-50">Previous</Link>}
          <span className="text-neutral-500">Page {page} of {pages}</span>
          {page < pages && <Link href={href(page + 1)} rel="next" className="rounded-lg border border-neutral-200 bg-white px-4 py-2 hover:bg-neutral-50">Next</Link>}
        </nav>
      )}
    </div>
  );
}
