'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';

interface Suggestion {
  id: string;
  title: string;
  slug: string;
  organization: string;
}

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(() => {
      setLoadingSuggestions(true);
      fetch(`/api/search-suggestions?q=${encodeURIComponent(query.trim())}`)
        .then((res) => res.json())
        .then((data) => setSuggestions(Array.isArray(data) ? data : []))
        .catch(() => setSuggestions([]))
        .finally(() => setLoadingSuggestions(false));
    }, 250);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const goToSearch = (q: string) => {
    const trimmed = q.trim();
    setShowDropdown(false);
    router.push(trimmed ? `/jobs?search=${encodeURIComponent(trimmed)}` : '/jobs');
  };

  const goToJob = (slug: string) => {
    setShowDropdown(false);
    router.push(`/jobs/${slug}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeIndex >= 0 && suggestions[activeIndex]) {
      goToJob(suggestions[activeIndex].slug);
    } else {
      goToSearch(query);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1 flex items-center gap-2 bg-white border border-neutral-200 rounded-lg px-4 py-3">
          <Search size={18} className="text-neutral-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowDropdown(true);
              setActiveIndex(-1);
            }}
            onFocus={() => setShowDropdown(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search for jobs, departments, exams..."
            className="flex-1 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none"
            autoComplete="off"
          />
          {loadingSuggestions && <Loader2 size={14} className="text-neutral-300 animate-spin shrink-0" />}
        </div>
        <Button type="submit" variant="primary" size="lg" icon={<Search size={18} />}>
          Search
        </Button>
      </form>

      {showDropdown && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-neutral-200 rounded-lg shadow-lg z-50 overflow-y-auto" style={{ maxHeight: "286px" }}>
          {suggestions.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => goToJob(s.slug)}
              onMouseEnter={() => setActiveIndex(i)}
              className={`w-full text-left px-4 py-2.5 flex items-center justify-between gap-3 transition-colors ${
                i === activeIndex ? 'bg-primary-50' : 'hover:bg-neutral-50'
              }`}
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-neutral-900 truncate">{s.title}</p>
                <p className="text-xs text-neutral-400 truncate">{s.organization}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
