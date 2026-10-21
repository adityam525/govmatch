import Link from 'next/link';
import OrgLogo from '@/components/shared/OrgLogo';
import { formatShortDate } from '@/lib/job-status';
import type { Recommendation } from '@/lib/recommendations';

function matchTone(score: number) {
  if (score >= 80) return 'bg-green-50 text-green-700';
  if (score >= 60) return 'bg-sky-50 text-sky-700';
  return 'bg-amber-50 text-amber-700';
}

function timing(item: Recommendation): { text: string; urgent: boolean } | null {
  if (item.opensOn) return { text: `Opens ${formatShortDate(item.opensOn)}`, urgent: false };
  if (item.daysLeft === null) return null;
  if (item.daysLeft === 0) return { text: 'Last day today', urgent: true };
  if (item.daysLeft === 1) return { text: '1 day left', urgent: true };
  return { text: `${item.daysLeft} days left`, urgent: item.daysLeft <= 3 };
}

// Phones show the first four rows, desktop shows all of them.
export default function RecommendedList({ items }: { items: Recommendation[] }) {
  return (
    <div className="divide-y divide-neutral-100">
      {items.map((item, index) => {
        const time = timing(item);
        return (
          <Link
            key={item.id}
            href={`/jobs/${item.slug}`}
            className={`group items-start gap-3 px-4 py-3 transition-colors hover:bg-neutral-50 ${
              index >= 4 ? 'hidden lg:flex' : 'flex'
            }`}
          >
            <OrgLogo name={item.organization} shortName={item.orgShortName} logoUrl={item.orgLogoUrl} size={36} />
            <div className="min-w-0 flex-1">
              <p
                title={item.title}
                className="line-clamp-2 text-[13px] font-semibold leading-snug text-neutral-900 group-hover:text-primary-700"
              >
                {item.title}
              </p>
              <p className="mt-0.5 truncate text-[11px] text-neutral-500">{item.organization}</p>
              {item.postCount > 1 && item.bestPost && (
                <p className="mt-0.5 truncate text-[11px] text-neutral-400">Best fit: {item.bestPost}</p>
              )}
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${matchTone(item.matchScore)}`}>
                  {item.matchScore}% match
                </span>
                {time && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] ${
                      time.urgent ? 'bg-red-50 text-red-600' : 'bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    {time.text}
                  </span>
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
