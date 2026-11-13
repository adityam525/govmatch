import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({ title: 'Plans', description: 'Compare the free plan and Premium tools for government exam preparation.', path: '/pricing' });

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
