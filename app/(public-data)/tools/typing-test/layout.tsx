import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'English typing speed test',
  description: 'Practise typing for clerk, assistant and data entry exams. Get your speed in words per minute and your accuracy.',
  path: '/tools/typing-test',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
