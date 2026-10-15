'use client';

import { usePathname } from 'next/navigation';

// Renders its (server-rendered) children everywhere except on the listed paths.
export default function HideOnPaths({ paths, children }: { paths: string[]; children: React.ReactNode }) {
  const pathname = usePathname();
  if (paths.includes(pathname)) return null;
  return <>{children}</>;
}
