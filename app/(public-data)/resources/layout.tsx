import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({ title: 'Study resources', description: 'Syllabus, exam patterns and previous year papers for government exams.', path: '/resources' });

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
