'use client';

import { useMemo, useState } from 'react';

import Hero from '@/components/study-zone/Hero';
import SectionTitle from '@/components/study-zone/SectionTitle';
import MockTestGrid from '@/components/mock-tests/MockTestGrid';

import useMockTests from '@/features/mock-tests/hooks/useMockTests';
import { filterMockTests } from '@/features/mock-tests/utils/filters';

export default function MockTestsPage() {
  const { tests, loading } = useMockTests();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const filtered = useMemo(() => {
    return filterMockTests(tests, {
      search,
      category,
    });
  }, [tests, search, category]);

  return (
    <div className="container mx-auto space-y-10 py-8">

      <Hero
        title="Government Mock Tests"
        description="Practice full-length mock tests for SSC, Banking, UPSC, Railway, Defence and State Exams."
      />

      <SectionTitle
        title="Find Your Mock Test"
        subtitle="Latest exam pattern with instant results."
      />

      <div className="grid gap-4 md:grid-cols-2">

        <input
          className="rounded-lg border p-3"
          placeholder="Search mock tests..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="rounded-lg border p-3"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="SSC">SSC</option>
          <option value="BANKING">Banking</option>
          <option value="UPSC">UPSC</option>
          <option value="RAILWAY">Railway</option>
          <option value="DEFENCE">Defence</option>
          <option value="STATE_PSC">State PSC</option>
        </select>

      </div>

      {loading ? (

        <div className="py-20 text-center">
          Loading...
        </div>

      ) : (

        <MockTestGrid tests={filtered} />

      )}

    </div>
  );
}
