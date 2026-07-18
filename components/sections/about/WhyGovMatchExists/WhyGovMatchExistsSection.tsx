import {
  Search,
  CalendarX2,
  AlertTriangle,
  ShieldCheck,
  BellRing,
  BrainCircuit,
  CheckCircle2,
} from "lucide-react";

import SectionHeader from "@/components/ui/SectionHeader";

const problems = [
  {
    icon: Search,
    title: "Searching Multiple Websites",
  },
  {
    icon: CalendarX2,
    title: "Missing Deadlines",
  },
  {
    icon: AlertTriangle,
    title: "Eligibility Confusion",
  },
];

const solutions = [
  {
    icon: BrainCircuit,
    title: "AI Job Matching",
  },
  {
    icon: BellRing,
    title: "Smart Notifications",
  },
  {
    icon: ShieldCheck,
    title: "Official Notifications",
  },
];

export default function WhyGovMatchExistsSection() {
  return (
    <section className="py-20 bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4">

        <SectionHeader
          title="Why GovMatch Exists"
          description="Finding the right government job shouldn't require visiting dozens of websites. We built GovMatch to simplify the entire journey."
          align="center"
        />

        <div className="mt-16 grid gap-10 lg:grid-cols-2">

          {/* LEFT */}

          <div>

            <h3 className="text-2xl font-bold">
              Our Mission
            </h3>

            <p className="mt-6 leading-8 text-neutral-600">
              Every year millions of aspirants spend countless hours
              searching government websites, checking eligibility,
              tracking deadlines and preparing for competitive exams.

              <br /><br />

              GovMatch brings everything together into one personalized
              platform so every candidate can focus on preparation,
              not searching.
            </p>

          </div>

          {/* RIGHT */}

          <div className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">

            <div className="grid gap-8 md:grid-cols-2">

              <div>

                <h4 className="mb-5 text-lg font-bold text-red-600">
                  Challenges
                </h4>

                <div className="space-y-5">
                  {problems.map((item) => (
                    <div key={item.title} className="flex gap-3">
                      <item.icon className="text-red-500" size={20}/>
                      <span>{item.title}</span>
                    </div>
                  ))}
                </div>

              </div>

              <div>

                <h4 className="mb-5 text-lg font-bold text-green-600">
                  Our Solution
                </h4>

                <div className="space-y-5">
                  {solutions.map((item) => (
                    <div key={item.title} className="flex gap-3">
                      <CheckCircle2 className="text-green-600" size={20}/>
                      <span>{item.title}</span>
                    </div>
                  ))}
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
