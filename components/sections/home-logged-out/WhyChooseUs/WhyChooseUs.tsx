import {
  UserCheck,
  Bell,
  BookOpen,
  ClipboardList,
  ShieldCheck,
} from "lucide-react";
import { colors } from "@/styles/tokens";

const features = [
  {
    icon: UserCheck,
    iconBg: colors.primary[600],
    title: "Personalized Matches",
    description:
      "Find government jobs based on your profile, qualification and eligibility.",
  },
  {
    icon: Bell,
    iconBg: colors.accent.orange,
    title: "Smart Job Alerts",
    description:
      "Never miss important notifications, deadlines or exam updates.",
  },
  {
    icon: BookOpen,
    iconBg: colors.accent.purple,
    title: "Complete Preparation",
    description:
      "Practice with mock tests, previous papers and study resources.",
  },
  {
    icon: ClipboardList,
    iconBg: colors.accent.green,
    title: "Application Tracker",
    description: "Manage applications, deadlines and progress in one place.",
  },
  {
    icon: ShieldCheck,
    iconBg: colors.primary[600],
    title: "Trusted Information",
    description: "Get verified updates collected from official sources.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <div className="mx-auto max-w-3xl text-center">
        <span className=" text-sm font-semibold uppercase tracking-[0.2em] text-primary-600">
          Why GovMatch
        </span>

        <h2 className=" mt-4 text-3xl font-bold text-neutral-900 md:text-5xl">
          Everything you need for your government job journey
        </h2>

        <p className=" mt-4 text-lg text-neutral-600">
          Discover opportunities, prepare effectively and stay updated
          throughout your exam journey.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {features.map((feature) => {
          const Icon = feature.icon;

          return (
            <div
              key={feature.title}
              className="
                group rounded-2xl border border-neutral-200 
                bg-white p-5 transition-all
                hover:-translate-y-1 hover:shadow-lg
              "
            >
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl"
                style={{
                  backgroundColor: `${feature.iconBg}15`,
                  color: feature.iconBg,
                }}
              >
                <Icon size={22} />
              </div>

              <h3 className="mt-4 text-sm font-semibold text-neutral-900">
                {feature.title}
              </h3>

              <p className="mt-2 text-xs leading-relaxed text-neutral-500">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
