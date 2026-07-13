import { User, Search } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import HeroIllustration from "./HeroIllustration";
import SocialProofStrip from "./SocialProofStrip";

export default function Hero() {
  return (
    <div>
      <Badge variant="info" className="mb-4">
        🛡️ India's Most Trusted Government Job Platform
      </Badge>

      <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 leading-tight">
        Find Government Jobs That{" "}
        <span className="text-primary-600">Match Your Profile</span>
      </h1>

      <p className="text-neutral-600 mt-4 max-w-lg">
        Get personalized job recommendations, timely alerts, exam updates, study
        resources and everything you need to build a successful government
        career.
      </p>

      <div className="flex flex-wrap gap-3 mt-6">
        <Button variant="primary" size="lg" icon={<User size={18} />}>
          Get Started – It's Free
        </Button>
        <Button variant="secondary" size="lg" icon={<Search size={18} />}>
          Explore Jobs
        </Button>
      </div>

      <SocialProofStrip />

      <div className="mt-8">
        <HeroIllustration />
      </div>
    </div>
  );
}
