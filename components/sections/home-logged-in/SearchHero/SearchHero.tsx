'use client';

import SearchBar from './SearchBar';
import PopularSearchTags from './PopularSearchTags';
import MatchScoreCard from './MatchScoreCard';
import { useJobMatches } from '@/features/matching/hooks';

interface SearchHeroProps {
  title?: string;
  subtitle?: string;
  showMatchScore?: boolean;
}

export default function SearchHero({
  title = 'Find Government Jobs That Match Your Profile',
  subtitle = 'Get personalized job recommendations, timely alerts, exam updates, study resources and everything you need to build a successful government career.',
  showMatchScore = false,
}: SearchHeroProps) {
  const { matches, loading } = useJobMatches();
  const topScore = matches.length > 0 ? matches[0].matchScore : null;

  return (
    <div className="min-h-[640px] flex items-center py-10 md:py-16">
      <div className="grid md:grid-cols-3 gap-6 items-center w-full">
        <div className="md:col-span-2">
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 leading-tight">
            {title}
          </h1>
          <p className="text-neutral-600 mt-3 max-w-xl">{subtitle}</p>

          <div className="mt-5">
            <SearchBar />
            <PopularSearchTags />
          </div>
        </div>

        <div className="flex justify-center md:justify-end relative">
          <img
            src="/illustrations/government-building.png"
            alt="Government building"
            className="w-full max-w-[420px] object-contain"
          />
          {showMatchScore && !loading && topScore !== null && (
            <div className="absolute -bottom-6 -left-4">
              <MatchScoreCard score={topScore} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
