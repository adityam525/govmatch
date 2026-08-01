'use client';

import { useState } from 'react';
import { ClipboardList, Play, RotateCcw } from 'lucide-react';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

interface InputEditorProps {
  initialValue?: string;
  onGenerate: (value: string) => void;
}

const SAMPLE = `1. Capital of India?

A. Mumbai
B. Delhi
C. Chennai
D. Kolkata

Answer: B

2. 2 + 2 = ?

A. 3
B. 4
C. 5
D. 6

Answer: B`;

export default function InputEditor({
  initialValue = SAMPLE,
  onGenerate,
}: InputEditorProps) {
  const [text, setText] = useState(initialValue);

  return (
    <Card padding="lg">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
          <ClipboardList size={22} />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-neutral-900">
            Practice Test Builder
          </h2>

          <p className="text-sm text-neutral-600">
            Paste MCQs below to instantly create a practice test.
          </p>
        </div>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste your MCQs here..."
        className="mt-6 h-[420px] w-full rounded-lg border border-neutral-300 p-4 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
      />

      <div className="mt-6 flex flex-wrap gap-3">
        <Button
          variant="primary"
          icon={<Play size={18} />}
          onClick={() => onGenerate(text)}
        >
          Generate Test
        </Button>

        <Button
          variant="secondary"
          icon={<RotateCcw size={18} />}
          onClick={() => setText(SAMPLE)}
        >
          Load Sample
        </Button>
      </div>

      <div className="mt-8 rounded-lg bg-neutral-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Supported Format
        </p>

        <pre className="mt-3 overflow-auto text-xs leading-6 text-neutral-700 whitespace-pre-wrap">
{`1. Question?

A. Option One
B. Option Two
C. Option Three
D. Option Four

Answer: B`}
        </pre>
      </div>
    </Card>
  );
}
