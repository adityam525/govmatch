import { Target, BookOpen, Bell, ClipboardList } from "lucide-react";
import FloatingFeatureCard from "./FloatingFeatureCard";
import MockupPreviewCard from "./MockupPreviewCard";
import { colors } from "@/styles/tokens";

const mockJobs = [
  { title: "Assistant Auditor", org: "SSC CGL 2025", matchPercent: 92 },
  { title: "Junior Engineer", org: "RRB Technician", matchPercent: 88 },
  { title: "Scientist B", org: "DRDO", matchPercent: 76 },
];

export default function HeroIllustration() {
  return (
    <div className="relative">
      {/* Base building illustration */}
      <div className="flex items-center justify-center py-8">
        <img
          src="/illustrations/gov-building.svg"
          alt="Government building"
          className="w-full max-w-md"
        />
      </div>

      {/* Floating cards positioned around illustration */}
      <FloatingFeatureCard
        icon={<Target size={18} />}
        iconBg={colors.accent.purple}
        title="Personalized"
        description="Job Matches"
        className="absolute top-4 left-0"
      />
      <FloatingFeatureCard
        icon={<BookOpen size={18} />}
        iconBg={colors.primary[600]}
        title="Exam Preparation"
        description="Mock tests, PYQs, study material"
        className="absolute top-4 right-0"
      />
      <FloatingFeatureCard
        icon={<Bell size={18} />}
        iconBg={colors.accent.orange}
        title="Smart Alerts"
        description="Never miss any important update"
        className="absolute bottom-16 left-0"
      />
      <FloatingFeatureCard
        icon={<ClipboardList size={18} />}
        iconBg={colors.accent.green}
        title="Application Tracker"
        description="Track & manage all your applications"
        className="absolute bottom-16 right-0"
      />

      {/* Centered laptop mockup */}
      <div className="max-w-sm mx-auto">
        <MockupPreviewCard jobs={mockJobs} />
      </div>
    </div>
  );
}
