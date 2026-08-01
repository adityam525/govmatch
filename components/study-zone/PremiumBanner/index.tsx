"use client";

import Link from "next/link";
import {
  ArrowRight,
  Brain,
  Crown,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";

import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

const features = [
  {
    icon: Brain,
    title: "AI MCQ Generator",
  },
  {
    icon: TrendingUp,
    title: "Performance Analytics",
  },
  {
    icon: Sparkles,
    title: "Weak Topic Detection",
  },
  {
    icon: Zap,
    title: "Unlimited Mock Tests",
  },
];

export default function PremiumBanner() {
  return (
    <section>
      <Card
        padding="lg"
        className="overflow-hidden border-0 bg-gradient-to-r from-primary-600 via-blue-600 to-indigo-700 text-white"
      >
        <div className="relative">
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10 blur-3xl" />

          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />

          <div className="relative flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <Badge
                variant="warning"
                icon={<Crown size={14} />}
                className="mb-5"
              >
                GovMatch Premium
              </Badge>

              <h2 className="text-3xl font-bold leading-tight">
                Unlock Premium Preparation Tools
              </h2>

              <p className="mt-5 leading-7 text-primary-100">
                Get access to AI-powered study tools, advanced analytics,
                personalized preparation plans, unlimited mock tests, revision
                planner and much more.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {features.map((feature) => {
                  const Icon = feature.icon;

                  return (
                    <div
                      key={feature.title}
                      className="flex items-center gap-3 rounded-xl bg-white/10 p-4 backdrop-blur-sm"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/15">
                        <Icon size={20} />
                      </div>

                      <span className="font-medium">{feature.title}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-neutral-900 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
                  <Crown size={28} />
                </div>

                <div>
                  <h3 className="text-xl font-bold">Premium</h3>

                  <p className="text-sm text-neutral-500">Coming Soon</p>
                </div>
              </div>

              <ul className="mt-6 space-y-3 text-sm">
                <li>✓ AI Generated Practice Tests</li>
                <li>✓ Smart Revision Planner</li>
                <li>✓ Unlimited Exam Attempts</li>
                <li>✓ Progress Analytics</li>
                <li>✓ Personalized Recommendations</li>
              </ul>

              <Link href="/pricing" className="mt-8 block">
                <Button
                  fullWidth
                  variant="primary"
                  icon={<ArrowRight size={18} />}
                  iconPosition="right"
                >
                  Join Waitlist
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
}
