import sanitizeHtml from 'sanitize-html';
import { prisma } from '@/lib/prisma';
import { httpUrl, slugify } from '@/lib/lookup-api';

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/+$/, '');

// Only these tags and attributes survive. Scripts, styles, event handlers and javascript: links do not.
export function sanitizeBlogHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ['p', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'blockquote', 'strong', 'em', 'u', 's', 'a', 'img', 'br', 'hr', 'code', 'pre'],
    allowedAttributes: { a: ['href', 'title', 'target', 'rel'], img: ['src', 'alt', 'title', 'loading'] },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedSchemesByTag: { img: ['http', 'https'] },
    allowProtocolRelative: false,
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: /^https?:/i.test(attribs.href ?? '') ? { ...attribs, target: '_blank', rel: 'noopener noreferrer' } : attribs,
      }),
      img: (tagName, attribs) => ({ tagName, attribs: { ...attribs, loading: 'lazy' } }),
    },
  });
}

const ENTITIES: Record<string, string> = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&nbsp;': ' ' };

export function textOf(html: string): string {
  const plain = sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} });
  return plain.replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (m) => ENTITIES[m] ?? m).replace(/\s+/g, ' ').trim();
}

export const readingMinutes = (html: string) => Math.max(1, Math.ceil(textOf(html).split(' ').filter(Boolean).length / 200));

export interface CleanBlog {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl: string | null;
  coverImageAlt: string | null;
  authorName: string;
  tags: string[];
  metaTitle: string | null;
  metaDescription: string | null;
  readMinutes: number;
  hasBody: boolean;
}

const opt = (v: unknown, max: number): string | null | undefined => {
  const t = String(v ?? '').trim();
  if (!t) return null;
  return t.length > max ? undefined : t;
};

export function cleanBlogInput(body: Record<string, any>): { error: string } | { data: CleanBlog } {
  const title = String(body.title ?? '').trim();
  if (!title || title.length > 160) return { error: 'Enter a title (up to 160 characters).' };

  const raw = String(body.content ?? '');
  if (raw.length > 400_000) return { error: 'The article is too long.' };
  const content = sanitizeBlogHtml(raw);
  const plain = textOf(content);

  const excerptIn = String(body.excerpt ?? '').trim();
  if (excerptIn.length > 300) return { error: 'The summary can be up to 300 characters.' };
  const excerpt = excerptIn || plain.slice(0, 160).trim();

  const metaTitle = opt(body.metaTitle, 70);
  if (metaTitle === undefined) return { error: 'The SEO title can be up to 70 characters.' };
  const metaDescription = opt(body.metaDescription, 170);
  if (metaDescription === undefined) return { error: 'The SEO description can be up to 170 characters.' };
  const coverImageAlt = opt(body.coverImageAlt, 160);
  if (coverImageAlt === undefined) return { error: 'The image description can be up to 160 characters.' };
  const authorName = opt(body.authorName, 80);
  if (authorName === undefined) return { error: 'The author name can be up to 80 characters.' };

  const cover = httpUrl(body.coverImageUrl ?? '');
  if (cover === undefined) return { error: 'The cover image must be a full web address starting with http:// or https://.' };

  const tagList = Array.isArray(body.tags) ? body.tags : String(body.tags ?? '').split(',');
  const tags = [...new Set(tagList.map((t: unknown) => String(t).trim()).filter(Boolean))] as string[];
  if (tags.length > 8) return { error: 'Use at most 8 tags.' };
  if (tags.some((t) => t.length > 30)) return { error: 'Each tag can be up to 30 characters.' };

  const slug = slugify(String(body.slug ?? '') || title).slice(0, 100).replace(/-+$/g, '');
  if (!slug) return { error: 'The address needs letters or numbers.' };

  return {
    data: {
      title, slug, excerpt, content, coverImageUrl: cover, coverImageAlt, authorName: authorName ?? 'GovMatch Team',
      tags, metaTitle, metaDescription, readMinutes: readingMinutes(content),
      hasBody: plain.length > 0 || content.includes('<img'),
    },
  };
}

export async function uniqueBlogSlug(base: string): Promise<string> {
  let candidate = base;
  for (let n = 2; n < 200; n++) {
    if (!(await prisma.blogPost.findUnique({ where: { slug: candidate }, select: { id: true } }))) return candidate;
    candidate = `${base}-${n}`;
  }
  return `${base}-${Date.now()}`;
}

// ---- Public queries: only published posts whose date has arrived.
const live = () => ({ published: true, publishedAt: { lte: new Date() } });
const card = { id: true, slug: true, title: true, excerpt: true, coverImageUrl: true, coverImageAlt: true, tags: true, readMinutes: true, publishedAt: true, authorName: true } as const;
export type BlogCardData = Awaited<ReturnType<typeof getLatestPosts>>[number];

export const PAGE_SIZE = 9;

export async function getBlogPage(page: number, tag?: string) {
  const where = { ...live(), ...(tag ? { tags: { has: tag } } : {}) };
  const [total, posts] = await Promise.all([
    prisma.blogPost.count({ where }),
    prisma.blogPost.findMany({ where, orderBy: { publishedAt: 'desc' }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE, select: card }),
  ]);
  return { total, posts, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export async function getBlogTags(): Promise<{ tag: string; count: number }[]> {
  const rows = await prisma.blogPost.findMany({ where: live(), select: { tags: true } });
  const counts = new Map<string, number>();
  for (const r of rows) for (const t of r.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  return [...counts.entries()].map(([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export const getBlogPost = (slug: string) => prisma.blogPost.findFirst({ where: { slug, ...live() } });

export async function getLatestPosts(excludeId: string | null, take = 3) {
  return prisma.blogPost.findMany({
    where: { ...live(), ...(excludeId ? { id: { not: excludeId } } : {}) },
    orderBy: { publishedAt: 'desc' },
    take,
    select: card,
  });
}
