'use client';

import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  ClipboardList,
  Clock3,
  FileText,
} from 'lucide-react';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

const activities = [
  {
    icon: ClipboardList,
    title: 'SSC CGL Mock Test #4',
    subtitle: 'Completed today',
    score: '82 / 100',
    color: 'bg-primary-50 text-primary-600',
    href: '/study-zone/mock-tests',
  },
  {
    icon: BookOpen,
    title: 'Indian Polity Practice',
    subtitle: 'Yesterday',
    score: '35 Questions',
    color: 'bg-green-50 text-green-600',
    href: '/study-zone/practice',
  },
  {
    icon: FileText,
    title: 'Previous Year Paper',
    subtitle: '2 days ago',
    score: 'SSC CGL 2023',
    color: 'bg-orange-50 text-orange-600',
    href: '/study-zone/previous-year-papers',
  },
];

export default function RecentActivity() {
  return (
    <section>

      <div className="flex items-center justify-between">

        <div>

          <h2 className="text-2xl font-bold text-neutral-900">
            Recent Activity
          </h2>

          <p className="mt-2 text-neutral-600">
            Continue from where you left off.
          </p>

        </div>

        <Link href="/dashboard/history">
          <Button variant="ghost">
            View All
          </Button>
        </Link>

      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">

        {activities.map((item) => {
          const Icon = item.icon;

          return (
            <Card
              key={item.title}
              hoverable
              padding="lg"
              className="flex h-full flex-col"
            >
              <div className="flex items-start justify-between">

                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.color}`}
                >
                  <Icon size={22} />
                </div>

                <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-600">
                  <Clock3 size={12} />
                  {item.subtitle}
                </span>

              </div>

              <h3 className="mt-5 text-lg font-semibold text-neutral-900">
                {item.title}
              </h3>

              <p className="mt-2 text-sm text-neutral-500">
                {item.score}
              </p>

              <div className="mt-auto pt-6">

                <Link href={item.href}>
                  <Button
                    fullWidth
                    variant="secondary"
                    icon={<ArrowRight size={16} />}
                    iconPosition="right"
                  >
                    Continue
                  </Button>
                </Link>

              </div>

            </Card>
          );
        })}

      </div>

    </section>
  );
}
