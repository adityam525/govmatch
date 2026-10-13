import { Briefcase, CalendarClock, Clock, FileCheck2, Trophy } from 'lucide-react';
import Link from 'next/link';
import { colors } from '@/styles/tokens';
import { getPublishedJobs, getAdmitCardRows, getResultRows } from '@/lib/job-queries';
import { todayIST } from '@/lib/job-status';

interface Stat {
  icon: React.ReactNode;
  iconBg: string;
  value: number;
  label: string;
  href: string;
}

export default async function QuickStatsBar() {
  const today = todayIST().getTime();
  const [jobs, admitCardJobs, resultJobs] = await Promise.all([
    getPublishedJobs(),
    getAdmitCardRows(Infinity),
    getResultRows(Infinity),
  ]);

  const live = jobs.filter((job) => job.phase === 'LIVE');
  const stats: Stat[] = [
    { icon: <Briefcase size={20} />, iconBg: colors.primary[600], value: live.length, label: 'Live Jobs', href: '/jobs?phase=live' },
    { icon: <CalendarClock size={20} />, iconBg: colors.accent.purple, value: jobs.filter((job) => job.phase === 'UPCOMING').length, label: 'Upcoming Jobs', href: '/jobs?phase=upcoming' },
    { icon: <Clock size={20} />, iconBg: colors.accent.orange, value: live.filter((job) => job.applicationEndDate?.getTime() === today).length, label: 'Last Date Today', href: '/jobs?phase=live' },
    { icon: <FileCheck2 size={20} />, iconBg: colors.accent.green, value: admitCardJobs.length, label: 'Admit Cards', href: '/admit-cards' },
    { icon: <Trophy size={20} />, iconBg: '#ec4899', value: resultJobs.length, label: 'Results Declared', href: '/results' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {stats.map((stat, i) => (
        <Link
          key={i}
          href={stat.href}
          className="bg-white border border-neutral-200 rounded-xl p-5 flex flex-col gap-3 hover:shadow-md hover:border-neutral-300 transition-all"
        >
          <div
            className="w-11 h-11 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${stat.iconBg}14`, color: stat.iconBg }}
          >
            {stat.icon}
          </div>
          <div>
            <p className="text-2xl font-bold text-neutral-900 leading-none">{stat.value.toLocaleString('en-IN')}</p>
            <p className="text-xs text-neutral-500 mt-1.5">{stat.label}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
