import SectionHeader from "@/components/ui/SectionHeader";
import FeatureCard from "./FeatureCard";
import { features } from "./data";

export default function WhyGovMatchSection() {
  return (
    <section className="bg-neutral-50 py-20">
      <div className="mx-auto max-w-7xl px-4">

        <SectionHeader
          title="Why Choose GovMatch?"
          description="Everything you need to discover, prepare for and track government job opportunities—all in one platform."
          align="center"
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard
              key={feature.title}
              {...feature}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
