'use client';

import { useState, useEffect } from 'react';

export function useUpdatesList(entity: string) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/${entity}`)
      .then((res) => res.json())
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error(`Failed to fetch ${entity}:`, err);
        setItems([]);
      })
      .finally(() => setLoading(false));
  }, [entity]);

  return { items, loading };
}
