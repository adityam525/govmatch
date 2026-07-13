import {
  UserCheck,
  Bell,
  BookOpen,
  ClipboardList,
  ShieldCheck,
} from "lucide-react";
import Card from "@/components/ui/Card";
import FeatureItem from "./FeatureItem";
import { colors } from "@/styles/tokens";

const features = [
  {
    icon: <UserCheck size={20} />,
    iconBg: colors.primary[600],
    title: "Personalized Matches",
    description: "Jobs that match your profile & eligibility",
  },
  {
    icon: <Bell size={20} />,
    iconBg: colors.accent.orange,
    title: "Smart Alerts",
    description: "Get instant notifications for new jobs & deadlines",
  },
  {
    icon: <BookOpen size={20} />,
    iconBg: colors.accent.purple,
    title: "Complete Guidance",
    description: "Preparation resources, mock tests & study material",
  },
  {
    icon: <ClipboardList size={20} />,
    iconBg: colors.accent.green,
    title: "Application Tracker",
    description: "Track all your applications in one place",
  },
  {
    icon: <ShieldCheck size={20} />,
    iconBg: colors.accent.green,
    title: "100% Reliable",
    description: "Authentic updates from official sources",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-10">
      <Card padding="lg">
        <h2 className="text-xl font-bold text-neutral-900 mb-6">
          Why Choose GovMatch?
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {features.map((feature, i) => (
            <FeatureItem key={i} {...feature} />
          ))}
        </div>
      </Card>
    </section>
  );
}
