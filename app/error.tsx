'use client';

import Link from 'next/link';

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="page-x mx-auto max-w-xl py-20 text-center">
      <p className="text-sm font-semibold text-danger">Something went wrong</p>
      <h1 className="page-title mt-2 text-neutral-900">We could not load this page</h1>
      <p className="mt-2 text-sm text-neutral-600">Please try again. If it keeps happening, contact us.</p>
      <div className="mt-6 flex justify-center gap-3">
        <button type="button" onClick={reset} className="rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700">Try again</button>
        <Link href="/" className="rounded-lg border border-neutral-200 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50">Home</Link>
      </div>
    </div>
  );
}
