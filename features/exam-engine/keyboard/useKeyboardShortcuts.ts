'use client';

import { useEffect } from 'react';

interface Props {
  next(): void;
  previous(): void;
  answer(option: string): void;
}

export default function useKeyboardShortcuts({
  next,
  previous,
  answer,
}: Props) {
  useEffect(() => {

    function onKeyDown(
      event: KeyboardEvent,
    ) {

      switch (event.key) {

        case '1':
          answer('A');
          break;

        case '2':
          answer('B');
          break;

        case '3':
          answer('C');
          break;

        case '4':
          answer('D');
          break;

        case 'ArrowRight':
          next();
          break;

        case 'ArrowLeft':
          previous();
          break;

      }

    }

    window.addEventListener(
      'keydown',
      onKeyDown,
    );

    return () => {

      window.removeEventListener(
        'keydown',
        onKeyDown,
      );

    };

  }, [
    answer,
    next,
    previous,
  ]);
}
