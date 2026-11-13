import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({ title: 'About GovMatch', description: 'How GovMatch matches government jobs to your qualification, age and category.', path: '/about' });

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
