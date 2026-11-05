import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Study Zone | GovMatch', description: 'Mock tests, previous papers, syllabus and tools to prepare for government exams.' };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
