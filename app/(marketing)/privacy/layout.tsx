import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({ title: 'Privacy Policy', description: 'How GovMatch collects, uses and protects your information.', path: '/privacy' });

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
