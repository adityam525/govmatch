import { Briefcase, CalendarClock, Clock, FileCheck2, Trophy } from "lucide-react";
import Link from "next/link";
import { getPublishedJobs, getAdmitCardRows, getResultRows } from "@/lib/job-queries";
import { isLastDateToday } from "@/lib/job-today";
import { todayIST } from "@/lib/job-status";

// Full class names so Tailwind can see them.
const TONES = {
  blue: "bg-primary-50 text-primary-600",
  violet: "bg-violet-50 text-accent-purple",
  orange: "bg-orange-50 text-accent-orange",
  green: "bg-green-50 text-accent-green",
  pink: "bg-pink-50 text-pink-600",
} as const;

interface Stat {
  icon: React.ReactNode;
  tone: keyof typeof TONES;
  value: number;
  label: string;
  href: string;
}

export default async function QuickStatsBar() {
  const today = todayIST();
  const [jobs, admitCardJobs, resultJobs] = await Promise.all([getPublishedJobs(), getAdmitCardRows(Infinity), getResultRows(Infinity)]);

  const stats: Stat[] = [
    { icon: <Briefcase size={20} />, tone: "blue", value: jobs.filter((job) => job.phase === "LIVE" && job.applicationOpen).length, label: "Applications Open", href: "/jobs" },
    { icon: <CalendarClock size={20} />, tone: "violet", value: jobs.filter((job) => job.phase === "UPCOMING").length, label: "Upcoming Jobs", href: "/jobs?phase=upcoming" },
    { icon: <Clock size={20} />, tone: "orange", value: jobs.filter((job) => isLastDateToday(job, today)).length, label: "Last Date Today", href: "/jobs?phase=today" },
    { icon: <FileCheck2 size={20} />, tone: "green", value: admitCardJobs.length, label: "Admit Cards", href: "/jobs?updates=admit-cards" },
    { icon: <Trophy size={20} />, tone: "pink", value: resultJobs.length, label: "Results Declared", href: "/jobs?updates=results" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
      {stats.map((stat) => (
        <Link
          key={stat.label}
          href={stat.href}
          className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-4 transition-all hover:border-neutral-300 hover:shadow-md sm:p-5"
        >
          <div className={"flex h-11 w-11 items-center justify-center rounded-lg " + TONES[stat.tone]}>{stat.icon}</div>
          <div>
            <p className="text-3xl font-bold leading-none text-neutral-900">{stat.value.toLocaleString("en-IN")}</p>
            <p className="mt-1.5 text-xs text-neutral-500">{stat.label}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
