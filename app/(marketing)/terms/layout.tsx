import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Terms and Conditions | GovMatch', description: 'The terms for using GovMatch.' };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
