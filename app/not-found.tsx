import Link from 'next/link';

export const metadata = { title: 'Page not found | GovMatch', robots: { index: false, follow: false } };

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-6 py-20 text-center">
      <p className="text-sm font-semibold text-primary-600">404</p>
      <h1 className="mt-2 text-2xl font-bold text-neutral-900">We could not find that page</h1>
      <p className="mt-2 text-sm text-neutral-600">The job or page may have been removed, or the address may be wrong.</p>
      <div className="mt-6 flex justify-center gap-3">
        <Link href="/jobs" className="rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700">Browse jobs</Link>
        <Link href="/" className="rounded-lg border border-neutral-200 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50">Home</Link>
      </div>
    </div>
  );
}
