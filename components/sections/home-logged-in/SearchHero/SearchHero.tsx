import SearchBar from "./SearchBar";
import PopularSearchTags from "./PopularSearchTags";
import MatchScoreCard from "./MatchScoreCard";

interface SearchHeroProps {
  title?: string;
  highlight?: string;
  subtitle?: string;
  matchScore?: number | null;
}

export default function SearchHero({
  title = "Find Government Jobs That",
  highlight = "Match Your Profile",
  subtitle = "Get personalized job recommendations, timely alerts, exam updates, study resources and everything you need to build a successful government career.",
  matchScore,
}: SearchHeroProps) {
  return (
    <div className="min-h-[540px] flex items-center py-10 md:py-16">
      <div className="grid md:grid-cols-2 gap-6 items-center w-full">
        <div className="md:col-span-1">
          <h1 className="text-3xl md:text-5xl font-bold text-neutral-900 leading-tight">
            {title} <span className="text-[#3A6BEE]">{highlight}</span>
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
            className="w-full object-contain"
          />
          {matchScore != null && (
            <div className="absolute -bottom-6 -left-4">
              <MatchScoreCard score={matchScore} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
