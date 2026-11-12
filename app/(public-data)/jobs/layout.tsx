import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({ title: 'Government jobs', description: 'Browse government job notifications with dates, vacancies, eligibility and how to apply.', path: '/jobs' });

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
