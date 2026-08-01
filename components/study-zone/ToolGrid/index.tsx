'use client';

import ToolCard from '../ToolCard';
import { StudyTool, StudyToolCategory } from '@/features/study-tools/types/study-tool';

interface ToolGridProps {
  tools: StudyTool[];
  category?: StudyToolCategory | 'all';
  featuredOnly?: boolean;
  className?: string;
  emptyMessage?: string;
}

export default function ToolGrid({
  tools,
  category = 'all',
  featuredOnly = false,
  className = '',
  emptyMessage = 'No study tools available.',
}: ToolGridProps) {
  const filteredTools = tools.filter((tool) => {
    if (featuredOnly && !tool.featured) return false;

    if (category !== 'all' && tool.category !== category) return false;

    return true;
  });

  if (filteredTools.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-12 text-center">
        <h3 className="text-lg font-semibold text-neutral-800">
          Nothing Found
        </h3>

        <p className="mt-2 text-sm text-neutral-500">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div
      className={`
        grid
        gap-6
        grid-cols-1
        sm:grid-cols-2
        xl:grid-cols-3
        2xl:grid-cols-4
        ${className}
      `}
    >
      {filteredTools.map((tool) => (
        <ToolCard
          key={tool.id}
          tool={tool}
        />
      ))}
    </div>
  );
}
