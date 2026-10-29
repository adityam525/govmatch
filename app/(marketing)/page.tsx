import { auth } from "@/lib/auth";
import {
  getRecommendations,
  type RecommendationResult,
} from "@/lib/recommendations";
import { getLastDateTodayJobs } from "@/lib/job-today";
import type { PublishedJob } from "@/lib/job-queries";

import QuickStatsBar from "@/components/sections/home-logged-in/QuickStatsBar";
import LatestJobsSection from "@/components/sections/home-logged-out/LatestJobsSection";
import CategoryStrip from "@/components/sections/home-logged-out/CategoryStrip";
import QualificationStrip from "@/components/sections/home-logged-out/QualificationStrip";
import LatestUpdatesGrid from "@/components/sections/home-logged-out/LatestUpdatesGrid";
import HowItWorks from "@/components/sections/shared/HowItWorks";
import MockTestPromo from "@/components/sections/shared/MockTestPromo";
import WhyChooseUs from "@/components/sections/home-logged-out/WhyChooseUs/WhyChooseUs";

import SearchHero from "@/components/sections/home-logged-in/SearchHero/SearchHero";
import ProfileStrengthCard from "@/components/sections/home-logged-in/ProfileStrengthCard";
import NotificationPromptCard from "@/components/sections/home-logged-in/NotificationPromptCard";
import MockTestPromoCard from "@/components/sections/home-logged-in/MockTestPromoCard";
import OrganizationStrip from "@/components/sections/home-logged-out/OrganizationStrip";
import StateStrip from "@/components/sections/home-logged-out/StateStrip";
import HomeHotNews from "@/components/sections/home/HomeHotNews";
import UpcomingJobsSection from "@/components/sections/home/UpcomingJobsSection";
import LatestJobsWithToday from "@/components/sections/home/LatestJobsWithToday";
import JobPicksCard from "@/components/sections/home/JobPicksCard";

async function loadPicks(userId: string): Promise<RecommendationResult | null> {
  try {
    return await getRecommendations(userId);
  } catch (error) {
    console.error("Home: could not load recommendations", error);
    return null;
  }
}

function LowerSections() {
  return (
    <>
      <CategoryStrip />
      <OrganizationStrip />
      <QualificationStrip />
      <StateStrip />
      <LatestUpdatesGrid />
      <HowItWorks />
      <MockTestPromo />
      <WhyChooseUs />
    </>
  );
}

export default async function HomePage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (userId) {
    const [picks, dueToday] = await Promise.all([
      loadPicks(userId),
      getLastDateTodayJobs().catch(() => [] as PublishedJob[]),
    ]);

    const topScore =
      picks?.items.find((item) => item.eligible)?.matchScore ?? null;

    return (
      <div className="bg-neutral-50">
        <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 sm:pt-8">
          <SearchHero matchScore={topScore} />
        </div>

        {/* Phones: picks, then jobs, then the smaller cards.
            Desktop: jobs on the left, picks and smaller cards stacked on the right. */}
        <div className="mx-auto grid max-w-7xl gap-6 px-4 pt-8 sm:px-6 lg:grid-cols-10 lg:grid-rows-[auto_1fr] lg:gap-x-8 lg:pt-10">
          <aside className="order-1 min-w-0 lg:order-none lg:col-span-3 lg:col-start-8 lg:row-start-1">
            <JobPicksCard picks={picks} dueToday={dueToday} />
          </aside>

          <div className="order-2 min-w-0 space-y-8 lg:order-none lg:col-span-7 lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:space-y-10">
            <QuickStatsBar />
            <HomeHotNews />
            <LatestJobsSection />
          </div>

          <div className="order-3 min-w-0 space-y-4 lg:order-none lg:col-span-3 lg:col-start-8 lg:row-start-2">
            {(picks?.strength ?? 0) < 100 && (
              <ProfileStrengthCard
                strength={picks?.strength ?? 0}
                missing={picks?.missing ?? []}
              />
            )}
            <NotificationPromptCard />
            <MockTestPromoCard />
          </div>
        </div>

        <div className="mx-auto max-w-7xl space-y-16 px-4 py-16 sm:px-6">
          <UpcomingJobsSection hideWhenEmpty />
          <LowerSections />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 sm:pt-8">
        <SearchHero />
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:pt-10">
        <QuickStatsBar />
      </div>

      <div className="mx-auto max-w-7xl space-y-16 px-4 py-16 sm:px-6">
        <HomeHotNews />
        <LatestJobsWithToday />
        <UpcomingJobsSection hideWhenEmpty />
        <LowerSections />
      </div>
    </div>
  );
}
