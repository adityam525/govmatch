'use client';

import { useEffect } from 'react';
import { Clock3 } from 'lucide-react';

interface TimerProps {
  seconds: number;
  onTimeout(): void;
}

function format(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  return [
    String(h).padStart(2, '0'),
    String(m).padStart(2, '0'),
    String(s).padStart(2, '0'),
  ].join(':');
}

export default function Timer({
  seconds,
  onTimeout,
}: TimerProps) {
  useEffect(() => {
    if (seconds === 0) {
      onTimeout();
    }
  }, [seconds, onTimeout]);

  return (
    <div className="flex items-center gap-2 rounded-lg bg-orange-50 px-4 py-2">
      <Clock3 size={18} />

      <span className="font-semibold">
        {format(seconds)}
      </span>
    </div>
  );
}
