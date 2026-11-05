import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Plans | GovMatch', description: 'Compare the free plan and Premium tools for government exam preparation.' };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
