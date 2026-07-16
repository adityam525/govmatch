import { Briefcase, CalendarClock, Clock, FileCheck2, Trophy } from 'lucide-react';
import Link from 'next/link';
import { colors } from '@/styles/tokens';

interface Stat {
  icon: React.ReactNode;
  iconBg: string;
  value: string;
  label: string;
  href: string;
}

const stats: Stat[] = [
  { icon: <Briefcase size={20} />, iconBg: colors.primary[600], value: '527', label: 'Live Jobs', href: '/jobs' },
  { icon: <CalendarClock size={20} />, iconBg: colors.accent.purple, value: '203', label: 'Upcoming Jobs', href: '/jobs' },
  { icon: <Clock size={20} />, iconBg: colors.accent.orange, value: '18', label: 'Last Date Today', href: '/jobs' },
  { icon: <FileCheck2 size={20} />, iconBg: colors.accent.green, value: '32', label: 'Admit Cards', href: '/admit-cards' },
  { icon: <Trophy size={20} />, iconBg: '#ec4899', value: '12', label: 'Results Declared', href: '/results' },
];

export default function QuickStatsBar() {
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
            <p className="text-2xl font-bold text-neutral-900 leading-none">{stat.value}</p>
            <p className="text-xs text-neutral-500 mt-1.5">{stat.label}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
