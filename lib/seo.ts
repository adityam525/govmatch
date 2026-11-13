import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/blog';

const SITE_NAME = 'GovMatch';

// One pattern for every static page's metadata.
export function pageMetadata({ title, description, path, noindex = false }: { title: string; description: string; path: string; noindex?: boolean }): Metadata {
  const url = SITE_URL + (path === '/' ? '' : path);
  const full = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  return {
    title: full,
    description,
    alternates: { canonical: url },
    robots: noindex ? { index: false, follow: false } : undefined,
    openGraph: { title: full, description, url, siteName: SITE_NAME, type: 'website', locale: 'en_IN' },
    twitter: { card: 'summary_large_image', title: full, description },
  };
}

// Structured data for a page that is part of the site's page trail.
export function breadcrumbJsonLd(trail: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t.name, item: SITE_URL + t.path })),
  };
}
