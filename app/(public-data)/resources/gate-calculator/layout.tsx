import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({ title: 'GATE score estimator', description: 'Estimate where your GATE score stands for PSU recruitment and M.Tech admission.', path: '/resources/gate-calculator' });

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
