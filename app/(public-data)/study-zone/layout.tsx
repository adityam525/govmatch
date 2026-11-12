import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({ title: 'Study Zone', description: 'Mock tests, previous papers, syllabus and tools to prepare for government exams.', path: '/study-zone' });

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
