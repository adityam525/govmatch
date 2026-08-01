'use client';

import Link from 'next/link';

import {
  Clock3,
  FileQuestion,
  Star,
  Users,
  ArrowRight,
} from 'lucide-react';

import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

import { MockTest } from '@/features/mock-tests/types/mock-test';

interface Props {
  test: MockTest;
}

export default function MockTestCard({
  test,
}: Props) {
  return (
    <Card
      hoverable
      className="h-full"
    >
      <div className="flex items-start justify-between">

        <Badge variant="info">
          {test.category}
        </Badge>

        {test.free ? (
          <Badge variant="success">
            FREE
          </Badge>
        ) : (
          <Badge variant="warning">
            PRO
          </Badge>
        )}

      </div>

      <h3 className="mt-5 text-xl font-bold">
        {test.title}
      </h3>

      <p className="mt-3 text-sm text-neutral-600">
        {test.description}
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 text-sm">

        <div className="flex items-center gap-2">
          <Clock3 size={16}/>
          {test.duration} mins
        </div>

        <div className="flex items-center gap-2">
          <FileQuestion size={16}/>
          {test.questions}
        </div>

        <div className="flex items-center gap-2">
          <Users size={16}/>
          {test.attempts.toLocaleString()}
        </div>

        <div className="flex items-center gap-2">
          <Star size={16}/>
          {test.rating}
        </div>

      </div>

      <Link
        href={`/study-zone/mock-tests/${test.slug}`}
        className="mt-6 block"
      >
        <Button
          fullWidth
          icon={<ArrowRight size={18}/>}
          iconPosition="right"
        >
          Start Test
        </Button>
      </Link>

    </Card>
  );
}
