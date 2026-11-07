'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';

// A dialog over the current page. The page behind stays scrollable. Closing goes back to it.
export default function Modal({ label, children }: { label: string; children: React.ReactNode }) {
  const router = useRouter();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') router.back(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [router]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true" aria-label={label}>
      <button type="button" aria-label="Close" onClick={() => router.back()} className="pointer-events-auto absolute inset-0 cursor-default bg-black/40" />
      <div className="pointer-events-auto relative z-10 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl sm:p-10">
        <button type="button" aria-label="Close" onClick={() => router.back()} className="absolute right-3 top-3 rounded-full p-1.5 text-neutral-500 hover:bg-neutral-100"><X size={18} /></button>
        {children}
      </div>
    </div>
  );
}
