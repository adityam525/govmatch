import SectionHeader from "@/components/ui/SectionHeader";

import { promises, stats } from "./data";
import StatCard from "./StatCard";
import TrustItem from "./TrustItem";

export default function TrustedSection() {
  return (
    <section className="bg-neutral-50 py-20">
      <div className="mx-auto max-w-7xl px-4">

        <SectionHeader
          title="Trusted by Government Job Aspirants"
          description="Reliable information, official notifications and a personalized experience you can depend on."
          align="center"
        />

        <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
            <StatCard
              key={item.label}
              {...item}
            />
          ))}
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {promises.map((item) => (
            <TrustItem
              key={item.title}
              {...item}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
