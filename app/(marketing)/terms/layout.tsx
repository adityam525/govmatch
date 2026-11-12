import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({ title: 'Terms and Conditions', description: 'The terms for using GovMatch.', path: '/terms' });

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
