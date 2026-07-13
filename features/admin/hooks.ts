'use client';

import { useState, useEffect, useCallback } from 'react';
import { adminApi } from './api';

export function useAdminList<T>(entity: string, params?: Record<string, string>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await adminApi.list<T>(entity, params);
      setData(result);
    } catch (err: any) {
      setError(err.message ?? 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [entity, JSON.stringify(params)]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const deleteRecord = async (id: string) => {
    await adminApi.remove(entity, id);
    setData((prev) => (prev as any[]).filter((r) => r.id !== id) as T[]);
  };

  return { data, loading, error, refetch: fetchData, deleteRecord };
}

export function useAdminRecord<T>(entity: string, id?: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(!!id);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    adminApi
      .getById<T>(entity, id)
      .then(setData)
      .finally(() => setLoading(false));
  }, [entity, id]);

  const save = async (values: Partial<T>) => {
    if (id) {
      return adminApi.update<T>(entity, id, values);
    }
    return adminApi.create<T>(entity, values);
  };

  return { data, loading, save };
}
