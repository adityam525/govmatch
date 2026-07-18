// import Link from "next/link";
// import { CheckCircle2 } from "lucide-react";
// import Button from "@/components/ui/Button";
// import TopicAccuracyChart from "@/components/shared/TopicAccuracyChart";

// const features = [
//   "Topic-wise performance analytics",
//   "Downloadable, watermarked mock papers",
//   "Previous years' question papers, tagged by exam",
// ];

// export default function MockTestPromo() {
//   return (
//     <section className="bg-neutral-900 rounded-xl p-6 md:p-10 grid md:grid-cols-2 gap-8 items-center overflow-hidden">
//       <div>
//         <h2 className="text-xl md:text-2xl font-bold text-white leading-tight">
//           Practice with mock tests built for the exam you're actually taking
//         </h2>
//         <p className="text-sm text-neutral-400 mt-3">
//           Full-length and sectional tests for SSC, IBPS, RRB and State PSC
//           patterns — auto-scored with All-India percentile ranking.
//         </p>

//         <ul className="space-y-2 mt-5">
//           {features.map((feature) => (
//             <li
//               key={feature}
//               className="flex items-start gap-2 text-sm text-neutral-200"
//             >
//               <CheckCircle2
//                 size={16}
//                 className="text-accent-amber mt-0.5 shrink-0"
//               />
//               {feature}
//             </li>
//           ))}
//         </ul>

//         <Link href="/study-zone/mock-tests">
//           <Button variant="primary" size="lg" className="mt-6">
//             Explore Prep Plans
//           </Button>
//         </Link>
//       </div>

//       <div className="flex items-center justify-center">
//         <TopicAccuracyChart />
//       </div>
//     </section>
//   );
// }

import Link from "next/link";
import { CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import Button from "@/components/ui/Button";
import TopicAccuracyChart from "@/components/shared/TopicAccuracyChart";

const features = [
  "Topic-wise accuracy tracking",
  "Watermarked downloadable mock papers",
  "Exam-tagged previous year questions",
];

export default function MockTestPromo() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800 p-6 md:p-10">
      {/* Background Glow */}
      <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-accent-amber/20 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="relative grid items-center gap-10 md:grid-cols-2">
        {/* Content */}
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-neutral-300">
            <Sparkles size={14} className="text-accent-amber" />
            AI-powered exam practice
          </div>

          <h2 className="mt-5 text-2xl font-bold leading-tight text-white md:text-4xl">
            Practice smarter with mock tests built for your exact exam
          </h2>

          <p className="mt-4 max-w-lg text-sm leading-relaxed text-neutral-400 md:text-base">
            Full-length and sectional tests for SSC, IBPS, RRB and State PSC
            patterns with instant evaluation, percentile ranking and detailed
            performance insights.
          </p>

          {/* Feature Cards */}
          <div className="mt-6 space-y-3">
            {features.map((feature) => (
              <div
                key={feature}
                className="group flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-3 transition hover:border-accent-amber/30 hover:bg-white/[0.06]"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-amber/10">
                  <CheckCircle2 size={16} className="text-accent-amber" />
                </div>

                <span className="text-sm text-neutral-200">{feature}</span>
              </div>
            ))}
          </div>

          <Link href="/study-zone/mock-tests">
            <Button
              variant="primary"
              size="lg"
              className="group mt-7 flex items-center gap-2"
            >
              Explore Prep Plans
              <ArrowRight
                size={18}
                className="transition-transform group-hover:translate-x-1"
              />
            </Button>
          </Link>
        </div>

        {/* Analytics Preview */}
        <div className="relative flex justify-center">
          <div className="absolute inset-0 scale-90 rounded-3xl bg-accent-amber/10 blur-3xl" />

          <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl backdrop-blur-xl">
            {/* Floating Stats */}
            <div className="mb-5 flex justify-between">
              <div>
                <p className="text-xs text-neutral-400">Average Accuracy</p>
                <p className="mt-1 text-2xl font-bold text-white">82%</p>
              </div>

              <div className="rounded-xl bg-green-400/10 px-3 py-2 text-right">
                <p className="text-xs text-green-400">Rank Growth</p>
                <p className="text-sm font-semibold text-green-300">+24%</p>
              </div>
            </div>

            <TopicAccuracyChart />

            <div className="mt-5 rounded-xl bg-black/20 p-3">
              <p className="text-xs text-neutral-400">Performance insight</p>
              <p className="mt-1 text-sm text-neutral-200">
                Improve weak topics before your next attempt.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
