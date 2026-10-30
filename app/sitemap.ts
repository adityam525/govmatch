import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { SITE_URL } from '@/lib/blog';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const pages: MetadataRoute.Sitemap = ['', '/jobs', '/blog', '/about', '/contact', '/pricing'].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: path === '' || path === '/jobs' ? 'daily' : 'monthly',
    priority: path === '' ? 1 : path === '/jobs' ? 0.9 : 0.5,
  }));

  try {
    const [jobs, posts] = await Promise.all([
      prisma.notification.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
      prisma.blogPost.findMany({ where: { published: true, publishedAt: { lte: now } }, select: { slug: true, updatedAt: true } }),
    ]);
    return [
      ...pages,
      ...jobs.map((j) => ({ url: `${SITE_URL}/jobs/${j.slug}`, lastModified: j.updatedAt, changeFrequency: 'daily' as const, priority: 0.8 })),
      ...posts.map((p) => ({ url: `${SITE_URL}/blog/${p.slug}`, lastModified: p.updatedAt, changeFrequency: 'monthly' as const, priority: 0.7 })),
    ];
  } catch (error) {
    console.error('Sitemap: could not load jobs and posts', error);
    return pages;
  }
}
