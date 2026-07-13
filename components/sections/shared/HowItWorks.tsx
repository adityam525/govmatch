import { UserCircle, Target, BellRing, GraduationCap } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: UserCircle,
    title: "Build your real profile",
    description:
      "Education, category, age, location, experience — or just upload your resume and we'll fill it in for you to review.",
  },
  {
    number: "02",
    icon: Target,
    title: "Get a verified Match %",
    description:
      "Every open notification is scored against your profile with a transparent, factor-by-factor breakdown.",
  },
  {
    number: "03",
    icon: BellRing,
    title: "Track & get alerted",
    description:
      "Save jobs, set deadline reminders, and get notified the moment a high-match listing goes live.",
  },
  {
    number: "04",
    icon: GraduationCap,
    title: "Prepare, then apply official",
    description:
      "Practice with exam-specific mock tests, then apply directly on the official government portal.",
  },
];

export default function HowItWorks() {
  return (
    <section>
      <h2 className="text-xl font-bold text-neutral-900 mb-1">How It Works</h2>
      <p className="text-sm text-neutral-600 mb-8">
        From profile to offer letter — four steps, fully guided.
      </p>

      <div className="grid md:grid-cols-4 gap-6 relative">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <div key={step.number} className="relative">
              {/* Connecting line to next step */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-6 left-[calc(50%+24px)] w-[calc(100%-24px)] h-px bg-neutral-200" />
              )}

              <div className="flex items-center gap-3 md:flex-col md:items-start md:gap-0">
                <div className="flex items-center justify-center w-12 h-12 rounded-full border-2 border-primary-600 bg-white text-primary-600 font-bold text-sm shrink-0 relative z-10">
                  {step.number}
                </div>
                <div className="md:mt-4">
                  <Icon
                    size={20}
                    className="text-primary-600 mb-2 hidden md:block"
                  />
                  <p className="text-sm font-semibold text-neutral-900">
                    {step.title}
                  </p>
                  <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
