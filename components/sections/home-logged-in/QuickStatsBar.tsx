import {
  Briefcase,
  CalendarClock,
  Clock,
  FileCheck2,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { colors } from "@/styles/tokens";

interface Stat {
  icon: React.ReactNode;
  iconBg: string;
  value: string;
  label: string;
  href: string;
}

const stats: Stat[] = [
  {
    icon: <Briefcase size={18} />,
    iconBg: colors.primary[600],
    value: "527",
    label: "Live Jobs",
    href: "/jobs",
  },
  {
    icon: <CalendarClock size={18} />,
    iconBg: colors.accent.purple,
    value: "203",
    label: "Upcoming Jobs",
    href: "/jobs",
  },
  {
    icon: <Clock size={18} />,
    iconBg: colors.accent.orange,
    value: "18",
    label: "Last Date Today",
    href: "/jobs",
  },
  {
    icon: <FileCheck2 size={18} />,
    iconBg: colors.accent.green,
    value: "32",
    label: "Admit Cards",
    href: "/admit-cards",
  },
  {
    icon: <Trophy size={18} />,
    iconBg: "#ec4899",
    value: "12",
    label: "Results Declared",
    href: "/results",
  },
];

export default function QuickStatsBar() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {stats.map((stat, i) => (
        <div
          key={i}
          className="bg-white border border-neutral-200 rounded-lg p-4 flex items-start gap-3"
        >
          <div
            className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0"
            style={{ backgroundColor: `${stat.iconBg}1A`, color: stat.iconBg }}
          >
            {stat.icon}
          </div>
          <div>
            <p className="text-lg font-bold text-neutral-900 leading-none">
              {stat.value}
            </p>
            <p className="text-xs text-neutral-600 mt-1">{stat.label}</p>
            <Link
              href={stat.href}
              className="text-xs font-medium text-primary-600 hover:underline mt-1 inline-block"
            >
              View all
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
