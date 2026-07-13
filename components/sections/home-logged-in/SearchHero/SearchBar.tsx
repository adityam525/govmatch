"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import Button from "@/components/ui/Button";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    router.push(
      trimmed ? `/jobs?search=${encodeURIComponent(trimmed)}` : "/jobs",
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="flex-1 flex items-center gap-2 bg-white border border-neutral-200 rounded-lg px-4 py-3">
        <Search size={18} className="text-neutral-400 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for jobs, departments, exams..."
          className="flex-1 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none"
        />
      </div>
      <Button
        type="submit"
        variant="primary"
        size="lg"
        icon={<Search size={18} />}
      >
        Search
      </Button>
    </form>
  );
}
