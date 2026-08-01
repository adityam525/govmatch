'use client';

import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  Clock3,
  PlayCircle,
} from 'lucide-react';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

export interface ContinueLearningProps {
  title?: string;
  exam?: string;
  progress?: number;
  totalQuestions?: number;
  duration?: string;
  href?: string;
}

export default function ContinueLearning({
  title = 'SSC CGL Tier-I Mock Test #4',
  exam = 'SSC Combined Graduate Level',
  progress = 55,
  totalQuestions = 100,
  duration = '18 min remaining',
  href = '/study-zone/mock-tests',
}: ContinueLearningProps) {
  const percentage = Math.min(
    100,
    Math.round((progress / totalQuestions) * 100)
  );

  return (
    <Card
      padding="lg"
      className="border-primary-100 bg-gradient-to-r from-primary-50 via-white to-blue-50"
    >
      <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

        <div className="flex flex-1 gap-5">

          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-primary-600">
            <BookOpen size={30} />
          </div>

          <div className="flex-1">

            <Badge variant="info">
              Continue Learning
            </Badge>

            <h2 className="mt-4 text-2xl font-bold text-neutral-900">
              {title}
            </h2>

            <p className="mt-2 text-sm text-neutral-600">
              {exam}
            </p>

            <div className="mt-6">

              <div className="mb-2 flex items-center justify-between text-sm">

                <span className="text-neutral-500">
                  Progress
                </span>

                <span className="font-semibold text-primary-600">
                  {progress} / {totalQuestions} ({percentage}%)
                </span>

              </div>

              <div className="h-3 overflow-hidden rounded-full bg-neutral-200">

                <div
                  className="h-full rounded-full bg-primary-600 transition-all duration-500"
                  style={{
                    width: `${percentage}%`,
                  }}
                />

              </div>

            </div>

          </div>

        </div>

        <div className="flex flex-col items-start gap-5 lg:items-end">

          <div className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm text-neutral-600 shadow-sm">

            <Clock3 size={16} />

            {duration}

          </div>

          <Link href={href}>
            <Button
              variant="primary"
              size="lg"
              icon={<PlayCircle size={18} />}
            >
              Resume Test
            </Button>
          </Link>

          <Link
            href="/study-zone/mock-tests"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            View All Mock Tests

            <ArrowRight size={16} />
          </Link>

        </div>

      </div>
    </Card>
  );
}
