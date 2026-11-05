import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Privacy Policy | GovMatch', description: 'How GovMatch collects, uses and protects your information.' };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
