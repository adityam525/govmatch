import { Bell, Zap, MapPin } from "lucide-react";
import PhoneMockup from "@/components/shared/PhoneMockup";

const features = [
  {
    icon: Bell,
    title: "Instant push alerts",
    description:
      "The moment a high-match job or admit card drops, you know first.",
  },
  {
    icon: Zap,
    title: "Built for speed",
    description:
      "Most application windows are short — no endless scrolling to find what matters.",
  },
  {
    icon: MapPin,
    title: "Location-aware matching",
    description:
      "See openings near you first, ranked by your actual eligibility.",
  },
];

export default function TakeWithYou() {
  return (
    <section className="bg-white border border-neutral-200 rounded-xl p-6 md:p-10">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 leading-tight">
            Take GovMatch with you
          </h2>
          <p className="text-sm text-neutral-600 mt-3 max-w-md leading-relaxed">
            Government job windows close fast. The GovMatch app keeps you ahead
            of every deadline, wherever you are.
          </p>

          <div className="space-y-5 mt-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary-50 text-primary-600 shrink-0">
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">
                      {feature.title}
                    </p>
                    <p className="text-xs text-neutral-600 mt-0.5">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3 mt-8">
            <button className="flex items-center gap-2 bg-neutral-900 text-white rounded-lg px-4 py-2.5 hover:bg-neutral-800 transition-colors">
              <span className="text-lg leading-none">&#9650;</span>
              <div className="text-left leading-tight">
                <p className="text-[10px] text-neutral-400">Get it on</p>
                <p className="text-sm font-semibold">Google Play</p>
              </div>
            </button>
            <button className="flex items-center gap-2 bg-neutral-900 text-white rounded-lg px-4 py-2.5 hover:bg-neutral-800 transition-colors">
              <div className="text-left leading-tight">
                <p className="text-[10px] text-neutral-400">Download on the</p>
                <p className="text-sm font-semibold">App Store</p>
              </div>
            </button>
          </div>
        </div>

        <div className="flex justify-center">
          <PhoneMockup score={78} />
        </div>
      </div>
    </section>
  );
}
