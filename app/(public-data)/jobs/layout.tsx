import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Government jobs | GovMatch', description: 'Browse government job notifications with dates, vacancies, eligibility and how to apply.' };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
