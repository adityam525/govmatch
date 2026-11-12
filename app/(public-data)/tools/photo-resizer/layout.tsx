import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Photo and signature resizer for application forms',
  description: 'Resize a photo or signature to the exact pixels and file size an application form asks for. Runs in your browser; nothing is uploaded.',
  path: '/tools/photo-resizer',
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
