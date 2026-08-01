"use client";

import { useMemo, useState } from "react";

import Hero from "@/components/study-zone/Hero";
import ContinueLearning from "@/components/study-zone/ContinueLearning";
import CategoryTabs from "@/components/study-zone/CategoryTabs";
import SectionTitle from "@/components/study-zone/SectionTitle";
import ToolGrid from "@/components/study-zone/ToolGrid";
import DailyChallenge from "@/components/study-zone/DailyChallenge";
import PremiumBanner from "@/components/study-zone/PremiumBanner";
import RecentActivity from "@/components/study-zone/RecentActivity";
import ToolStats from "@/components/study-zone/ToolStats";
import Link from "next/link";
import Button from "@/components/ui/Button";

import {
  STUDY_TOOLS,
  FEATURED_STUDY_TOOLS,
} from "@/features/study-tools/config/tools";

import { StudyToolCategory } from "@/features/study-tools/types/study-tool";

export default function StudyZonePage() {
  const [category, setCategory] = useState<StudyToolCategory | "all">("all");

  const filteredTools = useMemo(() => {
    if (category === "all") return STUDY_TOOLS;

    return STUDY_TOOLS.filter((tool) => tool.category === category);
  }, [category]);

  return (
    <main className="mx-auto max-w-7xl space-y-12 px-6 py-8">
      {/* Hero */}

      <Hero />

      {/* Continue Learning */}

      <ContinueLearning />

      {/* Statistics */}

      <ToolStats />

      {/* Featured */}

      <section>
        <SectionTitle
          title="Featured Study Tools"
          description="Popular tools used by thousands of GovMatch aspirants."
        />

        <div className="mt-6">
          <ToolGrid tools={FEATURED_STUDY_TOOLS} />
        </div>
      </section>

      {/* Categories */}

      <section>
        <SectionTitle
          title="All Study Tools"
          description="Everything required for your exam preparation."
        />

        <div className="mt-6">
          <CategoryTabs value={category} onChange={setCategory} />
        </div>

        <div className="mt-8">
          <ToolGrid tools={filteredTools} />
        </div>
      </section>
      {/* Daily Challenge */}

      <DailyChallenge />

      {/* Premium */}

      <PremiumBanner />

      {/* Recent Activity */}

      <RecentActivity />

      {/* Preparation Roadmap */}

      <section>
        <SectionTitle
          title="Preparation Roadmap"
          description="Recommended order to maximize your exam preparation."
        />

        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              step: "01",
              title: "Know the Exam",
              description:
                "Study syllabus, eligibility, exam pattern and previous year cutoffs.",
            },
            {
              step: "02",
              title: "Practice Daily",
              description:
                "Solve quizzes, mock tests and previous year questions every day.",
            },
            {
              step: "03",
              title: "Analyse Performance",
              description:
                "Track weak topics and improve your accuracy using analytics.",
            },
            {
              step: "04",
              title: "Revision",
              description:
                "Revise notes, formulas and bookmarked questions before exam day.",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 text-lg font-bold text-white">
                {item.step}
              </div>

              <h3 className="mt-5 text-lg font-semibold text-neutral-900">
                {item.title}
              </h3>

              <p className="mt-3 text-sm leading-6 text-neutral-600">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Study Zone */}

      <section>
        <SectionTitle
          title="Why Choose GovMatch Study Zone?"
          description="Designed specifically for Indian Government Exam Aspirants."
        />

        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Exam Specific",
              description:
                "Tools built exclusively for SSC, UPSC, Railway, Banking, Defence and State exams.",
            },
            {
              title: "AI Assisted",
              description:
                "Generate MCQs, quizzes and personalized study material instantly.",
            },
            {
              title: "No Installation",
              description: "Everything works directly inside your browser.",
            },
            {
              title: "Progress Tracking",
              description:
                "Keep track of preparation, mock scores and daily streaks.",
            },
            {
              title: "Previous Year Focus",
              description:
                "Practice questions based on actual government examinations.",
            },
            {
              title: "Completely Integrated",
              description:
                "Jobs, preparation and career planning on one platform.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-neutral-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-md"
            >
              <h3 className="text-lg font-semibold text-neutral-900">
                {feature.title}
              </h3>

              <p className="mt-3 text-sm leading-6 text-neutral-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>
      {/* Upcoming Tools */}

      <section>
        <SectionTitle
          title="Coming Soon"
          description="More powerful preparation tools are under development."
        />

        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            "MCQ Generator from PDF",
            "Previous Year Paper Analyzer",
            "Study Planner",
            "Weak Subject Detection",
            "Performance Analytics",
            "Daily AI Quiz",
          ].map((tool) => (
            <div
              key={tool}
              className="rounded-2xl border border-dashed border-primary-200 bg-primary-50/40 p-6"
            >
              <span className="inline-flex rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700">
                Coming Soon
              </span>

              <h3 className="mt-5 text-lg font-semibold text-neutral-900">
                {tool}
              </h3>

              <p className="mt-3 text-sm leading-6 text-neutral-600">
                This tool is already planned and will become available in an
                upcoming GovMatch release.
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}

      <section>
        <SectionTitle
          title="Frequently Asked Questions"
          description="Common questions about GovMatch Study Zone."
        />

        <div className="mt-8 space-y-4">
          {[
            {
              q: "Are all study tools free?",
              a: "Most tools are completely free. Premium tools will be clearly marked.",
            },
            {
              q: "Can I practice previous year questions?",
              a: "Yes. Previous year papers and topic-wise practice are available.",
            },
            {
              q: "Will my progress be saved?",
              a: "Yes. Once authentication is enabled, your progress and history will be synced.",
            },
            {
              q: "Which exams are supported?",
              a: "SSC, UPSC, Banking, Railway, Defence, Teaching and State Government examinations.",
            },
          ].map((faq) => (
            <div
              key={faq.q}
              className="rounded-xl border border-neutral-200 bg-white p-6"
            >
              <h3 className="font-semibold text-neutral-900">{faq.q}</h3>

              <p className="mt-2 text-sm leading-6 text-neutral-600">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}

      <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-primary-600 to-blue-700 px-8 py-14 text-center text-white">
        <h2 className="text-3xl font-bold">Ready to Start Your Preparation?</h2>

        <p className="mx-auto mt-5 max-w-2xl text-primary-100">
          Join thousands of government job aspirants using GovMatch to prepare
          smarter with mock tests, AI tools, study resources and personalized
          preparation.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href="/study-zone/mock-tests">
            <Button variant="primary" size="lg">
              Start Learning
            </Button>
          </Link>

          <Link href="/study-zone">
            <Button variant="secondary" size="lg">
              Explore All Tools
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
