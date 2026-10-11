import { UserRound, Target, FileCheck } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: UserRound,
    title: "Create your profile",
    description: "Add your education, category, location and preferences.",
  },
  {
    number: "02",
    icon: Target,
    title: "Find matching jobs",
    description: "Get government vacancies matched to your eligibility.",
  },
  {
    number: "03",
    icon: FileCheck,
    title: "Prepare & apply",
    description: "Practice, track deadlines and apply with confidence.",
  },
];

export default function HowItWorks() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
      {/* Header */}
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold tracking-widest text-primary-600">
          HOW IT WORKS
        </p>

        <h2 className="mx-auto mt-3 max-w-3xl text-[26px] font-bold leading-tight tracking-tight text-neutral-900 sm:text-3xl md:text-[40px]">
          Your journey from profile to government job
        </h2>

        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-neutral-500 sm:mt-4 sm:text-base">
          We helps you discover opportunities, prepare effectively and stay
          ahead.
        </p>
      </div>

      {/* Steps */}
      <div className="relative mt-8 grid grid-cols-1 gap-8 sm:mt-10 sm:gap-10 md:grid-cols-3 md:gap-6 lg:mt-12 lg:gap-8">
        {/* Connecting line: tablet and desktop only */}
        <div className="absolute left-[16%] right-[16%] top-8 hidden h-px bg-neutral-200 md:block" />

        {steps.map((step) => {
          const Icon = step.icon;

          return (
            <div key={step.number} className="relative min-w-0 text-center">
              {/* Icon */}
              <div className="relative z-10 mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-600 text-white shadow-md sm:h-16 sm:w-16">
                <Icon size={24} aria-hidden="true" />
              </div>

              {/* Step number */}
              <span className="mt-3 block text-xs font-semibold tracking-wide text-primary-600 sm:mt-4">
                STEP {step.number}
              </span>

              {/* Title */}
              <h3 className="mt-2 text-base font-semibold leading-6 text-neutral-900">
                {step.title}
              </h3>

              {/* Description */}
              <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-neutral-500">
                {step.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
