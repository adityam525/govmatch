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
    <div className="flex items-center py-8 md:py-16">
      <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-center w-full">
        <div className="md:col-span-1 order-2 md:order-1">
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-neutral-900 leading-tight">
            {title} <span className="text-[#3A6BEE]">{highlight}</span>
          </h1>
          <p className="text-sm md:text-base text-neutral-600 mt-3 max-w-xl">{subtitle}</p>
          <div className="mt-5">
            <SearchBar />
            <PopularSearchTags />
          </div>
        </div>
        <div className="flex justify-center md:justify-end relative order-1 md:order-2">
          <img
            src="/illustrations/government-building.png"
            alt="Government building"
            className="w-3/4 sm:w-2/3 md:w-full max-w-sm md:max-w-none object-contain"
          />
          {matchScore != null && (
            <div className="absolute -bottom-4 left-4 md:-bottom-6 md:-left-4">
              <MatchScoreCard score={matchScore} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
