"use client";

import { useAuth } from "@/features/auth/hooks";

import QuickStatsBar from "@/components/sections/home-logged-in/QuickStatsBar";
import LatestJobsSection from "@/components/sections/home-logged-out/LatestJobsSection";
import CategoryStrip from "@/components/sections/home-logged-out/CategoryStrip";
import QualificationStrip from "@/components/sections/home-logged-out/QualificationStrip";
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

export default function HomePage() {
  const { isLoggedIn } = useAuth();

  if (isLoggedIn) {
    return (
      <div className="bg-neutral-50">
        <div className="max-w-7xl mx-auto px-6 pt-8">
          <SearchHero matchScore={85} />
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-10 grid lg:grid-cols-10 gap-8 items-start">
          <div className="lg:col-span-7 space-y-10">
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

        <div className="max-w-7xl mx-auto px-6 space-y-16 py-16">
          <CategoryStrip />
          <QualificationStrip />
          <LatestUpdatesGrid />
          <HowItWorks />
          <MockTestPromo />
          {/* <TakeWithYou /> */}
          <WhyChooseUs />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-50">
      <div className="max-w-7xl mx-auto px-6 pt-8">
        <SearchHero />
      </div>

      {/* <div className="max-w-7xl mx-auto px-6 pt-8 flex justify-center md:justify-end">
        <AuthCard />
      </div> */}

      <div className="max-w-7xl mx-auto px-6 pt-10">
        <QuickStatsBar />
      </div>

      <div className="max-w-7xl mx-auto px-6 space-y-16 py-16">
        <LatestJobsSection />
        <CategoryStrip />
        <QualificationStrip />
        <LatestUpdatesGrid />
        <HowItWorks />
        <MockTestPromo />
        {/* <TakeWithYou /> */}
        <WhyChooseUs />
      </div>
    </div>
  );
}
