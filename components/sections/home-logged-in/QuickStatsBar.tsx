import { Briefcase, CalendarClock, Clock, FileCheck2, Trophy } from 'lucide-react';
import Link from 'next/link';
import { colors } from '@/styles/tokens';
import { prisma } from '@/lib/prisma';

interface Stat {
  icon: React.ReactNode;
  iconBg: string;
  value: number;
  label: string;
  href: string;
}

// Deadlines are stored as UTC midnight of the calendar date, so "today" is the
// current calendar date in India (IST, UTC+5:30) expressed as UTC midnight.
function todayStartIST(): Date {
  const ist = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
  return new Date(`${ist.toISOString().slice(0, 10)}T00:00:00.000Z`);
}

async function getCounts() {
  const todayStart = todayStartIST();
  const tomorrowStart = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

  const [live, upcoming, lastDateToday, admitCards, results] = await Promise.all([
    prisma.notification.count({
      where: {
        published: true,
        status: 'LIVE',
        OR: [{ applicationEndDate: null }, { applicationEndDate: { gte: todayStart } }],
      },
    }),
    prisma.notification.count({ where: { published: true, status: 'UPCOMING' } }),
    prisma.notification.count({
      where: {
        published: true,
        status: 'LIVE',
        applicationEndDate: { gte: todayStart, lt: tomorrowStart },
      },
    }),
    prisma.admitCard.count({ where: { notification: { published: true } } }),
    prisma.result.count({ where: { notification: { published: true } } }),
  ]);

  return { live, upcoming, lastDateToday, admitCards, results };
}

export default async function QuickStatsBar() {
  const counts = await getCounts();

  const stats: Stat[] = [
    { icon: <Briefcase size={20} />, iconBg: colors.primary[600], value: counts.live, label: 'Live Jobs', href: '/jobs' },
    { icon: <CalendarClock size={20} />, iconBg: colors.accent.purple, value: counts.upcoming, label: 'Upcoming Jobs', href: '/jobs' },
    { icon: <Clock size={20} />, iconBg: colors.accent.orange, value: counts.lastDateToday, label: 'Last Date Today', href: '/jobs' },
    { icon: <FileCheck2 size={20} />, iconBg: colors.accent.green, value: counts.admitCards, label: 'Admit Cards', href: '/admit-cards' },
    { icon: <Trophy size={20} />, iconBg: '#ec4899', value: counts.results, label: 'Results Declared', href: '/results' },
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
