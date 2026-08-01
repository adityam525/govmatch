import Link from 'next/link';
import { notFound } from 'next/navigation';

import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

import { getMockTest } from '@/features/mock-tests/api/getMockTest';

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function MockTestDetails({
  params,
}: Props) {
  const { id } = await params;

  const test = await getMockTest(id);

  if (!test) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-5xl py-10">

      <Badge variant="info">
        {test.category}
      </Badge>

      <h1 className="mt-5 text-4xl font-bold">
        {test.title}
      </h1>

      <p className="mt-4 text-neutral-600">
        {test.description}
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-2">

        <Card>

          <h3 className="font-semibold">
            Exam Details
          </h3>

          <div className="mt-5 space-y-3">

            <div className="flex justify-between">
              <span>Questions</span>
              <strong>{test.questions}</strong>
            </div>

            <div className="flex justify-between">
              <span>Duration</span>
              <strong>{test.duration} mins</strong>
            </div>

            <div className="flex justify-between">
              <span>Total Marks</span>
              <strong>{test.marks}</strong>
            </div>

            <div className="flex justify-between">
              <span>Negative Marking</span>
              <strong>{test.negativeMarking}</strong>
            </div>

            <div className="flex justify-between">
              <span>Difficulty</span>
              <strong>{test.difficulty}</strong>
            </div>

          </div>

        </Card>

        <Card>

          <h3 className="font-semibold">
            Instructions
          </h3>

          <ul className="mt-5 list-disc space-y-3 pl-5 text-sm text-neutral-600">
            <li>Read every question carefully.</li>
            <li>Do not refresh during exam.</li>
            <li>Timer starts immediately.</li>
            <li>Answers are auto-saved.</li>
            <li>Review before submission.</li>
          </ul>

          <Link
            href={`/study-zone/mock-tests/${test.slug}/attempt`}
            className="mt-8 block"
          >
            <Button fullWidth>
              Start Mock Test
            </Button>
          </Link>

        </Card>

      </div>

    </div>
  );
}
