import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/blog';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api/', '/dashboard', '/profile', '/applications', '/saved-jobs'] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
