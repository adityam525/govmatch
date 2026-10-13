import SearchBar from "./SearchBar";
import PopularSearchTags from "./PopularSearchTags";
import MatchScoreCard from "./MatchScoreCard";
import Image from "next/image";

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
    <section className="w-full py-8 sm:py-10 lg:py-16">
      <div className="grid w-full grid-cols-1 items-center gap-6 md:gap-8 lg:grid-cols-2">
        {/* LEFT: Animated gradient heading and search */}
        <div className="hero-content order-2 mx-auto w-full max-w-xl px-4 text-center md:max-w-2xl lg:order-1 lg:mx-0 lg:max-w-none lg:px-0 lg:text-left">
          <h1 className="hero-heading text-2xl font-bold leading-tight tracking-tight text-neutral-900 sm:text-3xl md:text-4xl xl:text-5xl">
            {title}{" "}
            <span className="hero-highlight hero-design-gradient">
              <span className="hero-highlight-text">{highlight}</span>
              <span aria-hidden="true" className="hero-underline" />
              <span aria-hidden="true" className="hero-sparkle">
                ✦
              </span>
            </span>
          </h1>

          <p className="hero-subtitle mx-auto mt-3 max-w-lg text-sm leading-6 text-neutral-600 sm:text-base sm:leading-7 md:max-w-2xl lg:mx-0 lg:max-w-none">
            {subtitle}
          </p>

          {/* Keep existing search bar width and functionality */}
          <div className="hero-search mx-auto mt-5 w-full max-w-xl lg:mx-0">
            <SearchBar />
            <PopularSearchTags />
          </div>
        </div>

        {/* RIGHT: Existing illustration — unchanged */}
        <div className="relative order-1 flex min-w-0 justify-center md:justify-center lg:order-2 lg:justify-end">
          <Image
            src="/illustrations/government-building.png"
            alt="Government building"
            width={700}
            height={600}
            priority
            sizes="(max-width: 640px) 75vw, (max-width: 1023px) 100vw, 50vw"
            className="h-auto w-3/4 max-w-sm object-contain sm:w-2/3 md:w-full md:max-w-lg lg:max-w-none"
          />

          {matchScore != null && (
            <div className="absolute bottom-0 left-4 sm:bottom-2 sm:left-[15%] lg:-bottom-6 lg:left-0">
              <MatchScoreCard score={matchScore} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
