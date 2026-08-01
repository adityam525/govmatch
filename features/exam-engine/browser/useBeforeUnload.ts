'use client';

import { useEffect } from 'react';

export default function useBeforeUnload(
  enabled = true,
) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    function handler(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = '';
    }

    window.addEventListener(
      'beforeunload',
      handler,
    );

    return () => {
      window.removeEventListener(
        'beforeunload',
        handler,
      );
    };
  }, [enabled]);
}
