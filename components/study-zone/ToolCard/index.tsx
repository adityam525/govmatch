'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Crown,
  Sparkles,
} from 'lucide-react';

import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

import { StudyTool } from '@/features/study-tools/types/study-tool';

interface ToolCardProps {
  tool: StudyTool;
  className?: string;
}

const colorClasses: Record<
  StudyTool['color'],
  {
    bg: string;
    text: string;
    border: string;
  }
> = {
  primary: {
    bg: 'bg-primary-50',
    text: 'text-primary-600',
    border: 'border-primary-100',
  },
  blue: {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    border: 'border-blue-100',
  },
  green: {
    bg: 'bg-green-50',
    text: 'text-green-600',
    border: 'border-green-100',
  },
  orange: {
    bg: 'bg-orange-50',
    text: 'text-orange-600',
    border: 'border-orange-100',
  },
  purple: {
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    border: 'border-purple-100',
  },
  red: {
    bg: 'bg-red-50',
    text: 'text-red-600',
    border: 'border-red-100',
  },
};

export default function ToolCard({
  tool,
  className = '',
}: ToolCardProps) {
  const Icon = tool.icon;
  const colors = colorClasses[tool.color];

  return (
    <Link
      href={tool.href}
      className={`group block h-full ${className}`}
    >
      <Card
        hoverable
        padding="lg"
        className="flex h-full flex-col transition-all duration-200 group-hover:-translate-y-1"
      >
        <div className="flex items-start justify-between">

          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl border ${colors.bg} ${colors.text} ${colors.border}`}
          >
            <Icon size={22} />
          </div>

          <div className="flex flex-wrap justify-end gap-2">

            {tool.badge && (
              <Badge variant="info">
                {tool.badge}
              </Badge>
            )}

            {tool.premium && (
              <Badge
                variant="warning"
                icon={<Crown size={12} />}
              >
                PRO
              </Badge>
            )}

            {tool.comingSoon && (
              <Badge variant="default">
                Coming Soon
              </Badge>
            )}

          </div>

        </div>

        <h3 className="mt-6 text-lg font-semibold text-neutral-900 transition-colors group-hover:text-primary-600">
          {tool.title}
        </h3>

        <p className="mt-2 flex-1 text-sm leading-6 text-neutral-600">
          {tool.description}
        </p>

        <div className="mt-6 flex items-center justify-between">

          <span className="inline-flex items-center gap-2 text-sm font-medium text-primary-600">

            Open Tool

            <ArrowRight
              size={16}
              className="transition-transform duration-200 group-hover:translate-x-1"
            />

          </span>

          {tool.featured && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600">

              <Sparkles size={14} />

              Featured

            </span>
          )}

        </div>

      </Card>
    </Link>
  );
}
