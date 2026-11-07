"use client";

import { useEffect, useRef, useState } from "react";
import {
  UserCheck,
  Bell,
  BookOpen,
  ClipboardList,
  ShieldCheck,
  ArrowUpRight,
} from "lucide-react";

import { colors } from "@/styles/tokens";

const features = [
  {
    icon: UserCheck,
    iconBg: colors.primary[600],
    title: "Personalized Matches",
    description:
      "Discover government jobs based on your profile, qualification and eligibility.",
    eyebrow: "FIND YOUR FIT",
    detail: "Opportunities tailored to you",
  },
  {
    icon: Bell,
    iconBg: colors.accent.orange,
    title: "Smart Job Alerts",
    description:
      "Never miss important notifications, application deadlines or exam updates.",
    eyebrow: "STAY INFORMED",
  },
  {
    icon: BookOpen,
    iconBg: colors.accent.purple,
    title: "Complete Preparation",
    description:
      "Practice with mock tests, previous papers and useful study resources.",
    eyebrow: "PREPARE SMARTER",
  },
  {
    icon: ClipboardList,
    iconBg: colors.accent.green,
    title: "Application Tracker",
    description:
      "Manage your applications, important deadlines and progress in one place.",
    eyebrow: "STAY ORGANIZED",
  },
  {
    icon: ShieldCheck,
    iconBg: colors.primary[600],
    title: "Trusted Information",
    description:
      "Get reliable updates collected from official government sources.",
    eyebrow: "INFORMATION YOU CAN TRUST",
  },
];

export default function WhyChooseUs() {
  const gridRef = useRef<HTMLDivElement>(null);

  const [visibleCards, setVisibleCards] = useState<Set<number>>(
    () => new Set(),
  );

  useEffect(() => {
    const grid = gridRef.current;

    if (!grid) return;

    if (!("IntersectionObserver" in window)) {
      setVisibleCards(new Set(features.map((_, index) => index)));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const index = Number(
            (entry.target as HTMLElement).dataset.featureIndex,
          );

          setVisibleCards((previous) => {
            const next = new Set(previous);
            next.add(index);
            return next;
          });

          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -35px 0px",
      },
    );

    grid.querySelectorAll("[data-feature-index]").forEach((card) => {
      observer.observe(card);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section className="w-full">
      {/* Section Header */}
      <div className="mx-auto mb-8 max-w-3xl text-center sm:mb-10 lg:mb-12">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-3 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-primary-600" />

          <span className="text-xs font-bold tracking-widest text-primary-700">
            THE GOVMATCH ADVANTAGE
          </span>
        </div>

        <h2 className="text-2xl font-bold leading-tight tracking-tight text-neutral-900 sm:text-3xl lg:text-4xl">
          Everything you need to move forward.
        </h2>

        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-neutral-500 sm:mt-4 sm:text-base sm:leading-7">
          Discover opportunities, prepare smarter and stay ahead throughout your
          government job journey.
        </p>
      </div>

      {/* Bento Feature Grid */}
      <div
        ref={gridRef}
        className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5"
      >
        {features.map((feature, index) => {
          const Icon = feature.icon;
          const isFeatured = index === 0;
          const isVisible = visibleCards.has(index);

          return (
            <article
              key={feature.title}
              data-feature-index={index}
              className={[
                "group relative isolate flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border",
                "transition-[transform,border-color,box-shadow] duration-300 ease-out",
                "hover:-translate-y-1 hover:shadow-lg",
                "motion-reduce:transform-none motion-reduce:transition-none",
                isFeatured
                  ? "border-primary-100 bg-gradient-to-br from-primary-50 via-white to-sky-50 p-5 sm:p-5 lg:col-span-2 lg:p-7"
                  : "border-neutral-200 bg-white p-5 hover:border-neutral-300",
                isVisible ? "why-feature-enter" : "",
                isVisible ? `why-feature-delay-${index}` : "",
              ].join(" ")}
            >
              {/* Decorative Background */}
              <div
                aria-hidden="true"
                className={[
                  "pointer-events-none absolute rounded-full blur-3xl transition-transform duration-500 group-hover:scale-125",
                  isFeatured
                    ? "-right-12 -top-20 h-64 w-64 bg-primary-200/30"
                    : "-right-10 -top-10 h-32 w-32 opacity-40",
                ].join(" ")}
                style={
                  !isFeatured
                    ? { backgroundColor: `${feature.iconBg}18` }
                    : undefined
                }
              />

              {/* Featured and Supporting Cards */}
              <div
                className={[
                  "relative z-10 flex h-full flex-col",
                  isFeatured ? "lg:max-w-[68%]" : "",
                ].join(" ")}
              >
                {/* Icon and Number */}
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={[
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110",
                      isFeatured ? "shadow-sm" : "",
                    ].join(" ")}
                    style={{
                      backgroundColor: `${feature.iconBg}18`,
                      color: feature.iconBg,
                    }}
                  >
                    <Icon size={24} strokeWidth={1.9} aria-hidden="true" />
                  </div>

                  <span className="text-xs font-bold tracking-wider text-neutral-400">
                    0{index + 1}
                  </span>
                </div>

                {/* Feature Content */}
                <div className="mt-4 sm:mt-5">
                  <p
                    className="mb-1.5 text-xs font-bold tracking-wider"
                    style={{ color: feature.iconBg }}
                  >
                    {feature.eyebrow}
                  </p>

                  <h3
                    className={[
                      "font-bold leading-snug tracking-tight text-neutral-900",
                      isFeatured
                        ? "text-lg sm:text-xl lg:text-2xl"
                        : "text-base sm:text-lg",
                    ].join(" ")}
                  >
                    {feature.title}
                  </h3>

                  <p
                    className={[
                      "mt-2 text-sm leading-6",
                      isFeatured ? "text-neutral-600" : "text-neutral-500",
                    ].join(" ")}
                  >
                    {feature.description}
                  </p>
                </div>

                {/* Featured Card Detail */}
                {isFeatured && (
                  <div className="mt-auto flex items-center gap-2 pt-4 text-sm font-semibold text-primary-700">
                    <span>{feature.detail}</span>

                    <ArrowUpRight
                      size={17}
                      aria-hidden="true"
                      className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                    />
                  </div>
                )}
              </div>

              {/* Desktop Featured Illustration */}
              {isFeatured && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-2 bottom-0 hidden h-full w-[34%] items-center justify-center lg:flex"
                >
                  <div className="relative flex aspect-square w-4/5 items-center justify-center rounded-full border border-primary-200/70 bg-white/40">
                    <div className="absolute inset-4 rounded-full border border-dashed border-primary-200" />

                    <div className="flex h-1/2 w-1/2 items-center justify-center rounded-3xl border border-primary-100 bg-white shadow-xl shadow-primary-900/5">
                      <UserCheck
                        className="h-1/2 w-1/2 text-primary-600"
                        strokeWidth={1.5}
                      />
                    </div>

                    <div className="absolute -right-2 top-5 rounded-lg border border-neutral-100 bg-white px-3 py-2 text-xs font-semibold text-neutral-600 shadow-md">
                      PROFILE
                    </div>

                    <div className="absolute -bottom-1 left-0 rounded-lg border border-neutral-100 bg-white px-3 py-2 text-xs font-semibold text-neutral-600 shadow-md">
                      ELIGIBILITY
                    </div>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
