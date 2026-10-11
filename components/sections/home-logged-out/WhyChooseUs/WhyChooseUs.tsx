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
    <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
      {/* Header */}
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold tracking-widest text-primary-600">
          WHY GOVMATCH
        </p>

        <h2 className="mx-auto mt-3 max-w-3xl text-[26px] font-bold leading-tight tracking-tight text-neutral-900 sm:text-3xl md:text-[40px]">
          Everything you need for your government job journey
        </h2>

        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-neutral-500 sm:mt-4 sm:text-base">
          Discover opportunities, prepare effectively and stay updated
          throughout your exam journey.
        </p>
      </div>

      {/* Feature cards */}
      <div className="mt-7 grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 sm:mt-9 sm:gap-4 lg:grid-cols-3 xl:grid-cols-5">
        {features.map((feature) => {
          const Icon = feature.icon;

          return (
            <div
              key={feature.title}
              className="flex min-w-0 flex-col rounded-xl border border-neutral-200 bg-white p-4 transition-shadow duration-200 hover:shadow-md sm:rounded-2xl sm:p-5"
            >
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                style={{
                  backgroundColor: `${feature.iconBg}15`,
                  color: feature.iconBg,
                }}
              >
                <Icon size={24} strokeWidth={2} aria-hidden="true" />
              </div>

              <h3 className="mt-3 break-words text-base font-semibold leading-6 text-neutral-900 sm:mt-4">
                {feature.title}
              </h3>

              <p className="mt-2 break-words text-sm leading-6 text-neutral-500">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
