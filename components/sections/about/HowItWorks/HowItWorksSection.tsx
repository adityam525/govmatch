import SectionHeader from "@/components/ui/SectionHeader";
import StepCard from "./StepCard";
import { steps } from "./data";

export default function HowItWorksSection() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4">

        <SectionHeader
          title="How GovMatch Works"
          description="Finding the right government job has never been easier."
          align="center"
        />

        <div className="mt-16 grid gap-8 md:grid-cols-2 xl:grid-cols-4">
          {steps.map((step) => (
            <StepCard
              key={step.step}
              {...step}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
