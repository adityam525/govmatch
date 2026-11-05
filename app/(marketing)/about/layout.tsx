import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'About GovMatch | GovMatch', description: 'How GovMatch matches government jobs to your qualification, age and category.' };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
