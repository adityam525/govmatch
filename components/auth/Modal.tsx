'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';

// A dialog over the current page. Closing it goes back to the page underneath.
export default function Modal({ label, children }: { label: string; children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') router.back(); };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = previous; };
  }, [router]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={label}>
      <button type="button" aria-label="Close" onClick={() => router.back()} className="absolute inset-0 cursor-default bg-black/50" />
      <div className="relative z-10 max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <button type="button" aria-label="Close" onClick={() => router.back()} className="absolute right-3 top-3 rounded-full p-1.5 text-neutral-500 hover:bg-neutral-100"><X size={18} /></button>
        {children}
      </div>
    </div>
  );
}
