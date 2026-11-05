import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Contact us | GovMatch', description: 'Write to the GovMatch team with questions, corrections or feedback.' };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
