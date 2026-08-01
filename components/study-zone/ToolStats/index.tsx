'use client';

import {
  BookOpen,
  ClipboardCheck,
  Trophy,
  Target,
} from 'lucide-react';

import Card from '@/components/ui/Card';

const stats = [
  {
    icon: BookOpen,
    value: '500+',
    label: 'Mock Tests',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: ClipboardCheck,
    value: '20,000+',
    label: 'Practice Questions',
    color: 'bg-green-50 text-green-600',
  },
  {
    icon: Trophy,
    value: '100+',
    label: 'Study Resources',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: Target,
    value: '95%',
    label: 'Success Focus',
    color: 'bg-primary-50 text-primary-600',
  },
];

export default function ToolStats() {
  return (
    <section>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <Card
              key={item.label}
              hoverable
              padding="lg"
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.color}`}
              >
                <Icon size={22} />
              </div>

              <h3 className="mt-5 text-3xl font-bold text-neutral-900">
                {item.value}
              </h3>

              <p className="mt-2 text-sm text-neutral-600">
                {item.label}
              </p>
            </Card>
          );
        })}

      </div>

    </section>
  );
}
