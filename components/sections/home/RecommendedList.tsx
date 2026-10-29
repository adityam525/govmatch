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

// Every row has the same fixed height, so exactly three fit in the card's list area.
export default function RecommendedList({ items }: { items: Recommendation[] }) {
  return (
    <div className="divide-y divide-neutral-100">
      {items.map((item) => {
        const time = timing(item);
        return (
          <Link
            key={item.id}
            href={`/jobs/${item.slug}`}
            className="group flex h-[6.5rem] shrink-0 items-start gap-3 overflow-hidden px-4 py-3 transition-colors hover:bg-neutral-50"
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
              <div className="mt-1.5 flex flex-nowrap items-center gap-1.5 overflow-hidden">
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${matchTone(item.matchScore)}`}>
                  {item.matchScore}% match
                </span>
                {item.preferred && (
                  <span className="shrink-0 rounded-full bg-violet-50 px-2 py-0.5 text-[11px] text-violet-700">Preferred</span>
                )}
                {time && (
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] ${
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
