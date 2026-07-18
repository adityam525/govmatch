import Link from "next/link";
import { ArrowRight, UserPlus } from "lucide-react";

import Button from "@/components/ui/Button";

import TrustBadge from "./TrustBadge";

export default function BottomCTASection() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4">

        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-700 via-primary-600 to-primary-500 px-8 py-20 text-center text-white shadow-2xl">

          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-white blur-3xl" />
            <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-white blur-3xl" />
          </div>

          <div className="relative z-10 mx-auto max-w-3xl">

            <h2 className="text-4xl font-bold leading-tight md:text-5xl">
              Ready to Start Your Government Career Journey?
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-primary-100">
              Join GovMatch to discover verified government jobs,
              receive personalized recommendations, track applications,
              and prepare with confidence.
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-4">

              <Link href="/register">
                <Button
                  size="lg"
                  variant="secondary"
                  icon={<UserPlus size={18} />}
                >
                  Create Free Profile
                </Button>
              </Link>

              <Link href="/jobs">
                <Button
                  size="lg"
                  variant="ghost"
                  className="border border-white/30 bg-white/10 text-white hover:bg-white/20"
                  icon={<ArrowRight size={18} />}
                >
                  Explore Jobs
                </Button>
              </Link>

            </div>

            <div className="mt-10 flex flex-wrap justify-center gap-4">

              <TrustBadge text="Free Forever" />

              <TrustBadge text="Official Notifications" />

              <TrustBadge text="No Spam Alerts" />

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
