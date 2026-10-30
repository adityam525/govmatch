import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import BlogCard, { blogDate } from '@/components/blog/BlogCard';
import { SITE_URL, getBlogPost, getLatestPosts } from '@/lib/blog';
import '@/components/blog/blog-content.css';

export const dynamic = 'force-dynamic';

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return { title: 'Article not found | GovMatch', robots: { index: false } };

  const title = post.metaTitle || post.title;
  const description = post.metaDescription || post.excerpt;
  const url = `${SITE_URL}/blog/${post.slug}`;
  return {
    title: `${title} | GovMatch`,
    description,
    alternates: { canonical: url },
    keywords: post.tags,
    openGraph: {
      type: 'article', title, description, url,
      publishedTime: post.publishedAt?.toISOString(), modifiedTime: post.updatedAt.toISOString(),
      authors: [post.authorName], tags: post.tags,
      images: post.coverImageUrl ? [{ url: post.coverImageUrl, alt: post.coverImageAlt || post.title }] : undefined,
    },
    twitter: { card: post.coverImageUrl ? 'summary_large_image' : 'summary', title, description, images: post.coverImageUrl ? [post.coverImageUrl] : undefined },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) notFound();
  const latest = await getLatestPosts(post.id, 3);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.metaDescription || post.excerpt,
    image: post.coverImageUrl ? [post.coverImageUrl] : undefined,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: { '@type': 'Person', name: post.authorName },
    publisher: { '@type': 'Organization', name: 'GovMatch' },
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
    keywords: post.tags.join(', '),
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* "<" is escaped so the data cannot close the script tag. */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />

      <article className="mx-auto max-w-3xl">
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-neutral-500">
          <Link href="/" className="hover:underline">Home</Link> / <Link href="/blog" className="hover:underline">Blog</Link>
        </nav>

        <header>
          {post.tags.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {post.tags.map((t) => (
                <Link key={t} href={`/blog?tag=${encodeURIComponent(t)}`} className="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-700 hover:bg-primary-100">{t}</Link>
              ))}
            </div>
          )}
          <h1 className="text-3xl font-bold leading-tight text-neutral-900 sm:text-4xl">{post.title}</h1>
          <p className="mt-3 text-sm text-neutral-500">
            By {post.authorName} · <time dateTime={post.publishedAt?.toISOString()}>{blogDate(post.publishedAt)}</time> · {post.readMinutes} min read
          </p>
        </header>        {post.coverImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.coverImageUrl} alt={post.coverImageAlt || post.title} className="mt-6 aspect-[16/9] w-full rounded-2xl object-cover" />
        )}

        {/* Sanitized when the post was saved. */}
        <div className="blog-content mt-8" dangerouslySetInnerHTML={{ __html: post.content }} />
      </article>

      {latest.length > 0 && (
        <section aria-labelledby="latest-posts" className="mx-auto mt-14 max-w-5xl border-t border-neutral-200 pt-8">
          <div className="mb-5 flex items-center justify-between">
            <h2 id="latest-posts" className="text-xl font-bold text-neutral-900">Latest articles</h2>
            <Link href="/blog" className="text-sm font-medium text-primary-600 hover:underline">View all</Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {latest.map((p) => <BlogCard key={p.id} post={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
