import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Study resources | GovMatch', description: 'Syllabus, exam patterns and previous year papers for government exams.' };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
