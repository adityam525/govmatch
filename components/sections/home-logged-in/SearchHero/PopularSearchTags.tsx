'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface PopularSearch {
  label: string;
  query: string;
}

export default function PopularSearchTags() {
  const [popularSearches, setPopularSearches] = useState<PopularSearch[]>([]);

  useEffect(() => {
    fetch('/api/popular-searches')
      .then((r) => r.json())
      .then((data) => setPopularSearches(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  if (popularSearches.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mt-3">
      <span className="text-sm text-neutral-600">Popular Searches:</span>
      {popularSearches.map((item) => (
        <Link
          key={item.query}
          href={`/jobs?search=${encodeURIComponent(item.query)}`}
          className="text-xs font-medium text-neutral-600 bg-white border border-neutral-200 rounded-full px-3 py-1.5 hover:border-primary-300 hover:text-primary-600 transition-colors"
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}
