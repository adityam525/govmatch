"use client";

import { useAuth } from "@/features/auth/hooks";

import QuickStatsBar from "@/components/sections/home-logged-in/QuickStatsBar";
import LatestJobsSection from "@/components/sections/home-logged-out/LatestJobsSection";
import CategoryStrip from "@/components/sections/home-logged-out/CategoryStrip";
import LatestUpdatesGrid from "@/components/sections/home-logged-out/LatestUpdatesGrid";
import HowItWorks from "@/components/sections/shared/HowItWorks";
import MockTestPromo from "@/components/sections/shared/MockTestPromo";
import TakeWithYou from "@/components/sections/shared/TakeWithYou";
import WhyChooseUs from "@/components/sections/home-logged-out/WhyChooseUs/WhyChooseUs";

import AuthCard from "@/components/sections/home-logged-out/AuthCard/AuthCard";

import SearchHero from "@/components/sections/home-logged-in/SearchHero/SearchHero";
import RecommendedJobsSidebar from "@/components/sections/home-logged-in/RecommendedJobsSidebar";
import ProfileStrengthCard from "@/components/sections/home-logged-in/ProfileStrengthCard";
import NotificationPromptCard from "@/components/sections/home-logged-in/NotificationPromptCard";
import MockTestPromoCard from "@/components/sections/home-logged-in/MockTestPromoCard";
import QualificationStrip from "@/components/sections/home-logged-out/QualificationStrip";

export default function HomePage() {
  const { isLoggedIn } = useAuth();

  if (isLoggedIn) {
    return (
      <div className="bg-neutral-50">
        {/* Hero — full width, no sidebar */}
        <div className="max-w-7xl mx-auto px-6 pt-8">
          <SearchHero showMatchScore={true} />
        </div>

        {/* 70/30 grid — stats + job listings paired with sticky sidebar */}
        <div className="max-w-7xl mx-auto px-6 pt-8 grid lg:grid-cols-10 gap-6 items-start">
          <div className="lg:col-span-7 space-y-8">
            <QuickStatsBar />
            <LatestJobsSection />
          </div>

          <div className="lg:col-span-3 lg:sticky lg:top-20 space-y-6">
            <RecommendedJobsSidebar />
            <ProfileStrengthCard />
            <NotificationPromptCard />
            <MockTestPromoCard />
          </div>
        </div>

        {/* Full-width sections */}
        <div className="max-w-7xl mx-auto px-6 space-y-8 py-8">
          <CategoryStrip />
          <LatestUpdatesGrid />
          <HowItWorks />
          <MockTestPromo />
          <TakeWithYou />
          <WhyChooseUs />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-50">
      {/* Hero — full width */}
      <div className="max-w-7xl mx-auto px-6 pt-8">
        <SearchHero />
      </div>

      {/* Auth card — its own full-width row, right-aligned */}
      {/* <div className="max-w-7xl mx-auto px-6 pt-8 flex justify-center md:justify-end">
        <AuthCard />
      </div> */}

      {/* Everything below — full width, single column */}
      <div className="max-w-7xl mx-auto px-6 space-y-8 py-8">
        <QuickStatsBar />
        <LatestJobsSection />
        <CategoryStrip />
        <QualificationStrip />
        <LatestUpdatesGrid />
        <HowItWorks />
        <MockTestPromo />
        <TakeWithYou />
        <WhyChooseUs />
      </div>
    </div>
  );
}
