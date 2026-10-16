import Link from 'next/link';
import { getPopularOrganizations, type PopularOrganization } from '@/lib/popular-searches';

// Desktop shows five tags with the "Popular Searches:" label. On phones the
// label is hidden and only the first four tags show.
export default async function PopularSearchTags() {
  let items: PopularOrganization[] = [];
  try {
    items = await getPopularOrganizations(5);
  } catch (error) {
    console.error('PopularSearchTags: could not load organizations', error);
    return null;
  }
  if (items.length === 0) return null;

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <span className="hidden text-sm text-neutral-600 sm:inline">Popular Searches:</span>
      {items.map((item, index) => (
        <Link
          key={item.slug}
          href={`/jobs?organizations=${encodeURIComponent(item.slug)}&phase=all`}
          title={`${item.jobs} ${item.jobs === 1 ? 'job' : 'jobs'}, ${item.vacancies.toLocaleString('en-IN')} vacancies`}
          className={`${index >= 4 ? 'hidden sm:inline-flex' : 'inline-flex'} items-center rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:border-primary-300 hover:text-primary-600`}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}
