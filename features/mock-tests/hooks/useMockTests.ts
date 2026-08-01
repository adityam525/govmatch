'use client';

import { useEffect, useState } from 'react';

import { getMockTests } from '../api/getMockTests';
import { MockTest } from '../types/mock-test';

export default function useMockTests() {
  const [tests, setTests] = useState<MockTest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMockTests().then((data) => {
      setTests(data);
      setLoading(false);
    });
  }, []);

  return {
    tests,
    loading,
  };
}
