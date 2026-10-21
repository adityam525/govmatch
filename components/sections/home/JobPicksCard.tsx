import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import SidebarTabs, { type SidebarTab } from './SidebarTabs';
import RecommendedList from './RecommendedList';
import DueTodayList from './DueTodayList';
import type { RecommendationResult } from '@/lib/recommendations';
import type { PublishedJob } from '@/lib/job-queries';

const MAX_PICKS = 10;
const MAX_DUE = 20;

const footerLink = 'text-xs font-medium text-primary-600 hover:underline';

function Message({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-6 text-center text-xs leading-relaxed text-neutral-500">
      {children}
    </div>
  );
}

// "Recommended for you" and "Last date today" share one slot as tabs. The second
// tab only exists when a job really closes today.
export default function JobPicksCard({
  picks,
  dueToday,
}: {
  picks: RecommendationResult | null;
  dueToday: PublishedJob[];
}) {
  const eligible = (picks?.items ?? []).filter((item) => item.eligible).slice(0, MAX_PICKS);

  let matches: React.ReactNode;
  let matchesFooter: React.ReactNode = (
    <Link href="/jobs" className={footerLink}>
      Browse all jobs
    </Link>
  );

  if (!picks) {
    matches = <Message>Your matches could not be loaded just now. Please refresh in a moment.</Message>;
  } else if (picks.status === 'no-profile' || picks.incomplete) {
    matches = (
      <Message>
        <p>Add your qualification and date of birth to see jobs that fit you.</p>
        <Link
          href="/profile"
          className="mt-3 inline-block rounded-lg bg-primary-600 px-4 py-2 text-xs font-semibold text-white hover:bg-primary-700"
        >
          Complete profile
        </Link>
      </Message>
    );
  } else {
    matches = (
      <>
        {picks.incomplete && (
          <div className="mx-4 mt-3 rounded-lg bg-amber-50 px-3 py-2 text-[11px] leading-relaxed text-amber-800">
            Matches are rough until you add your qualification and date of birth.{' '}
            <Link href="/profile" className="font-semibold underline">
              Update profile
            </Link>
          </div>
        )}
        {eligible.length === 0 ? (
          <Message>No open jobs match your profile right now. New ones appear here as soon as they are posted.</Message>
        ) : (
          <RecommendedList items={eligible} />
        )}
      </>
    );
    if (eligible.length > 0) {
      matchesFooter = (
        <Link href="/jobs?sort=relevance" className={footerLink}>
          See all matches
        </Link>
      );
    }
  }

  const tabs: SidebarTab[] = [{ id: 'matches', label: 'Matches', content: matches, footer: matchesFooter }];
  if (dueToday.length > 0) {
    tabs.push({
      id: 'due',
      label: 'Due today',
      count: dueToday.length,
      tone: 'urgent',
      content: <DueTodayList jobs={dueToday.slice(0, MAX_DUE)} />,
      footer: (
        <Link href="/jobs?phase=today" className={footerLink}>
          View all {dueToday.length}
        </Link>
      ),
    });
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 px-4 pb-2 pt-4">
        <Sparkles size={16} className="text-primary-600" />
        <h2 className="text-sm font-bold text-neutral-900">Recommended for you</h2>
      </div>
      <SidebarTabs tabs={tabs} />
    </section>
  );
}
