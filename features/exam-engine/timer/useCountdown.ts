'use client';

import { useEffect } from 'react';

export default function useCountdown(
  running: boolean,
  onTick: () => void,
) {
  useEffect(() => {
    if (!running) {
      return;
    }

    const interval = setInterval(() => {
      onTick();
    }, 1000);

    return () => clearInterval(interval);
  }, [running, onTick]);
}
