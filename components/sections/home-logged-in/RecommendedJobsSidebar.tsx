'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Card from '@/components/ui/Card';
import SectionHeader from '@/components/ui/SectionHeader';
import { useJobMatches } from '@/features/matching/hooks';

function MatchRing({ percent }: { percent: number }) {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative w-12 h-12 shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="4" />
        <circle
          cx="24" cy="24" r={radius} fill="none" stroke="#16a34a" strokeWidth="4"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[10px] font-bold text-neutral-900">{percent}%</span>
      </div>
    </div>
  );
}

export default function RecommendedJobsSidebar() {
  const { matches, loading } = useJobMatches();
  const topMatches = matches.slice(0, 3);

  return (
    <Card padding="lg">
      <SectionHeader title="Recommended For You" viewAllHref="/jobs" />

      {loading ? (
        <p className="text-sm text-neutral-400 py-6 text-center">Loading matches...</p>
      ) : topMatches.length === 0 ? (
        <p className="text-sm text-neutral-400 py-6 text-center">Complete your profile to see matches.</p>
      ) : (
        <div>
          {topMatches.map((match) => (
            <Link
              key={match.postId}
              href={`/jobs/${match.slug}`}
              className="flex items-start gap-3 py-3 border-b border-neutral-100 last:border-0 hover:bg-neutral-50 -mx-2 px-2 rounded-md transition-colors"
            >
              <div className="flex items-center justify-center w-9 h-9 rounded-md bg-neutral-100 text-[9px] font-bold text-neutral-600 shrink-0">
                {match.organization?.slice(0, 4) ?? '—'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-neutral-900 truncate">{match.postTitle}</p>
                <p className="text-xs text-neutral-400">{match.notificationTitle}</p>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Last Date: {match.applicationEndDate ? new Date(match.applicationEndDate).toLocaleDateString('en-IN') : 'TBA'}
                </p>
              </div>
              <div className="flex flex-col items-center gap-1 shrink-0">
                <MatchRing percent={match.matchScore} />
                <span className="text-[10px] text-success font-medium">Match</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Link href="/jobs" className="flex items-center justify-center gap-1 text-sm font-medium text-primy-600 hover:text-primary-700 mt-3">
        View All Recommended Jobs
        <ArrowRight size={14} />
      </Link>
    </Card>
  );
}
