import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'GATE score estimator | GovMatch', description: 'Estimate where your GATE score stands for PSU recruitment and M.Tech admission.' };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
