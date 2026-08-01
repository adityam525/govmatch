'use client';

import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  Brain,
  ClipboardList,
  Sparkles,
  Trophy,
} from 'lucide-react';

import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

interface HeroProps {
  title?: string;
  description?: string;
}

const stats = [
  {
    icon: ClipboardList,
    value: '500+',
    label: 'Mock Tests',
  },
  {
    icon: Brain,
    value: '20K+',
    label: 'Practice Questions',
  },
  {
    icon: BookOpen,
    value: '100+',
    label: 'Study Resources',
  },
];

export default function Hero({
  title = 'Study Smarter. Crack Government Exams Faster.',
  description = 'Everything you need to prepare for SSC, UPSC, Banking, Railway, Defence and State Government exams — all in one place.',
}: HeroProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-primary-100 bg-gradient-to-br om-primary-50 via-white to-blue-50">

      <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-primary-100 blur-3xl opacity-40" />

      <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-blue-100 blur-3xl opacity-40" />

      <div className="relative grid gap-10 p-8 lg:grid-cols-2 lg:items-center lg:p-12">

        <div>

          <Badge
            variant="info"
            icon={<Sparkles size={14} />}
            className="mb-5"
          >
            GovMatch Study Zone
          </Badge>

          <h1 className="text-4xl font-bold leading-tight text-neutral-900 lg:text-5xl">
            {title}
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-neutral-600">
            {description}
          </p>

          <div className="mt-8 flex flex-wrap gap-4">

            <Link href="/study-zone/mock-tests">
              <Button
                variant="primary"
                size="lg"
                icon={<ArrowRight size={18} />}
                iconPosition="right"
              >
                Start Practicing
              </Button>
            </Link>

            <Link href="/study-zone">
              <Button
                variant="secondary"
                size="lg"
              >
                Explore Tools
              </Button>
            </Link>

          </div>

          <div className="mt-10 grid grid-cols-3 gap-4">

            {stats.map((item) => {
              const Icon = item.icon;

              return (
                <Card
                  key={item.label}
                  padding="md"
                  className="text-center"
                >
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                    <Icon size={22} />
                  </div>

                  <p className="mt-4 text-2xl font-bold text-neutral-900">
                    {item.value}
                  </p>

                  <p className="mt-1 text-xs text-neutral-500">
                    {item.label}
                  </p>

                </Card>
              );
            })}

          </div>

        </div>

        <Card
          padding="lg"
          className="border-primary-100"
        >

          <div className="flex items-center justify-between">

            <div>

              <p className="text-xs font-semibold uppercase tracking-widest text-primary-600">
                Learning Progress
              </p>

              <h2 className="mt-2 text-2xl font-bold text-neutral-900">
                Keep Going 🚀
              </h2>

            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
              <Trophy size={28} />
            </div>

          </div>

          <div className="mt-8">

            <div className="flex items-center justify-between text-sm">

              <span className="text-neutral-600">
                Weekly Goal
            </span>

              <span className="font-semibold text-primary-600">
                70%
              </span>

            </div>

            <div className="mt-2 h-3 overflow-hidden rounded-full bg-neutral-100">

              <div className="h-full w-[70%] rounded-full bg-primary-600" />

            </div>

          </div>

          <div className="mt-8 rounded-2xl border border-neutral-200 bg-neutral-50 p-5">

            <p className="text-xs uppercase tracking-wide text-neutral-500">
              Continue Learning
            </p>

            <h3 className="mt-2 text-lg font-semibold text-neutral-900">
              SSC CGL Mock Test #4
            </h3>

            <p className="mt-1 text-sm text-neutral-500">
              Progress: 55 / 100 Questions
            </p>

            <Link
              href="/study-zone/mock-tests"
              className="mt-5 block"
            >
              <Button
                fullWidth
                variant="primary"
              >
                Resume Test
              </Button>
            </Link>

          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">

            <div className="rounded-xl bg-green-50 p-4">

              <p className="text-3xl font-bold text-green-600">
                42
              </p>

              <p className="mt-1 text-sm text-green-700">
                Tests Completed
              </p>

            </div>

            <div className="rounded-xl bg-orange-50 p-4">

              <p className="text-3xl font-bold text-orange-600">
                86%
              </p>

              <p className="mt-1 text-sm text-orange-700">
                Best Accuracy
              </p>

            </div>

          </div>

        </Card>

      </div>

    </section>
  );
}
