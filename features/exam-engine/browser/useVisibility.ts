'use client';

import { useEffect } from 'react';

interface Props {
  onHidden(): void;
}

export default function useVisibility({
  onHidden,
}: Props) {
  useEffect(() => {
    function handler() {
      if (document.hidden) {
        onHidden();
      }
    }

    document.addEventListener(
      'visibilitychange',
      handler,
    );

    return () => {
      document.removeEventListener(
        'visibilitychange',
        handler,
      );
    };
  }, [onHidden]);
}
