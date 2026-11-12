export default function Loading() {
  return (
    <div className="page-x mx-auto max-w-5xl py-10" role="status" aria-label="Loading">
      <div className="h-7 w-48 animate-pulse rounded bg-neutral-200" />
      <div className="mt-3 h-4 w-80 max-w-full animate-pulse rounded bg-neutral-100" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => <div key={i} className="h-32 animate-pulse rounded-xl bg-neutral-100" />)}
      </div>
    </div>
  );
}
