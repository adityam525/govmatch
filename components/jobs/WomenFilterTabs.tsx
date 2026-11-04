import Link from 'next/link';

type Params = { [key: string]: string | undefined };
const OPTIONS: [string, string][] = [['', 'All posts'], ['only', 'Women only'], ['open', 'Open to women']];

function hrefFor(params: Params, value: string) {
  const next = new URLSearchParams();
  for (const [key, v] of Object.entries(params)) if (v && key !== 'women') next.set(key, v);
  if (value) next.set('women', value);
  const qs = next.toString();
  return qs ? '/jobs?' + qs : '/jobs';
}

export default function WomenFilterTabs({ params }: { params: Params }) {
  const current = params.women === 'only' || params.women === 'open' ? params.women : '';
  return (
    <div className="flex flex-wrap items-center gap-1.5" aria-label="Posts for women">
      <span className="text-xs font-medium text-neutral-500">Posts:</span>
      {OPTIONS.map(([value, label]) => (
        <Link
          key={value || 'all'}
          href={hrefFor(params, value)}
          aria-current={current === value ? 'page' : undefined}
          className={'whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium ' + (current === value ? 'border-primary-600 bg-primary-600 text-white' : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50')}
        >
          {label}
        </Link>
      ))}
    </div>
  );
}
