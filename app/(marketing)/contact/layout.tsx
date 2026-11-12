import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({ title: 'Contact us', description: 'Write to the GovMatch team with questions, corrections or feedback.', path: '/contact' });

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
