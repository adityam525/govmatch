import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Photo and signature resizer for application forms | GovMatch',
  description: 'Resize a photo or signature to the exact pixels and file size an application form asks for. Runs in your browser; nothing is uploaded.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
