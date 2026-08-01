'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Clock3,
  Flame,
  HelpCircle,
} from 'lucide-react';

import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function DailyChallenge() {
  return (
    <section>

      <Card
        padding="lg"
        className="border-primary-100 bg-gradient-to-r from-primary-50 via-white to-blue-50"
      >

        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

          <div className="flex gap-5">

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 text-primary-600">
              <HelpCircle size={30} />
            </div>

            <div>

              <Badge
                variant="warning"
                icon={<Flame size={14} />}
              >
                Daily Challenge
              </Badge>

              <h2 className="mt-4 text-2xl font-bold text-neutral-900">
                Solve Today's Challenge
              </h2>

              <p className="mt-3 max-w-xl text-neutral-600">
                Practice one carefully selected question every day to
                maintain consistency and improve your accuracy.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">

                <span className="rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700">
                  Medium Difficulty
                </span>

                <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                  General Awareness
                </span>

                <span className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-sm font-medium text-orange-700">
                  <Clock3 size={14} />
                  5 Minutes
                </span>

              </div>

            </div>

          </div>

          <div className="flex flex-col items-start gap-4 lg:items-end">

            <div className="rounded-xl bg-white p-5 shadow-sm">

              <p className="text-xs uppercase tracking-wider text-neutral-500">
                Current Streak
              </p>

              <h3 className="mt-2 text-4xl font-bold text-primary-600">
                🔥 12
              </h3>

              <p className="mt-1 text-sm text-neutral-500">
                days in a row
              </p>

            </div>

            <Link href="/study-zone/daily-challenge">
              <Button
                variant="primary"
                size="lg"
                icon={<ArrowRight size={18} />}
                iconPosition="right"
              >
                Start Challenge
              </Button>
            </Link>

          </div>

        </div>

      </Card>

    </section>
  );
}
