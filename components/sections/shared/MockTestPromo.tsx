import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import Button from "@/components/ui/Button";
import TopicAccuracyChart from "@/components/shared/TopicAccuracyChart";

const features = [
  "Topic-wise performance analytics",
  "Downloadable, watermarked mock papers",
  "Previous years' question papers, tagged by exam",
];

export default function MockTestPromo() {
  return (
    <section className="bg-neutral-900 rounded-xl p-6 md:p-10 grid md:grid-cols-2 gap-8 items-center overflow-hidden">
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-white leading-tight">
          Practice with mock tests built for the exam you're actually taking
        </h2>
        <p className="text-sm text-neutral-400 mt-3">
          Full-length and sectional tests for SSC, IBPS, RRB and State PSC
          patterns — auto-scored with All-India percentile ranking.
        </p>

        <ul className="space-y-2 mt-5">
          {features.map((feature) => (
            <li
              key={feature}
              className="flex items-start gap-2 text-sm text-neutral-200"
            >
              <CheckCircle2
                size={16}
                className="text-accent-amber mt-0.5 shrink-0"
              />
              {feature}
            </li>
          ))}
        </ul>

        <Link href="/study-zone/mock-tests">
          <Button variant="primary" size="lg" className="mt-6">
            Explore Prep Plans
          </Button>
        </Link>
      </div>

      <div className="flex items-center justify-center">
        <TopicAccuracyChart />
      </div>
    </section>
  );
}
