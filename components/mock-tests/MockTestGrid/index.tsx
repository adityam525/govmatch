'use client';

import MockTestCard from '../MockTestCard';

import { MockTest } from '@/features/mock-tests/types/mock-test';

interface Props {
  tests: MockTest[];
}

export default function MockTestGrid({
  tests,
}: Props) {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

      {tests.map((test) => (

        <MockTestCard
          key={test.id}
          test={test}
        />

      ))}

    </div>
  );
}
