import Link from 'next/link';
import { FileText, ClipboardList, BookOpen, Calculator } from 'lucide-react';
import Card from '@/components/ui/Card';

const resources = [
  {
    icon: ClipboardList,
    title: 'Mock Tests',
    description: 'Full-length and sectional tests for SSC, IBPS, RRB and State PSC patterns',
    href: '/study-zone/mock-tests',
    color: '#2563eb',
  },
  {
    icon: FileText,
    title: 'Previous Year Papers',
    description: "Practice with actual questions from previous years' exams, tagged by exam",
    href: '/resources',
    color: '#7c3aed',
  },
  {
    icon: BookOpen,
    title: 'Syllabus & Exam Pattern',
    description: 'Detailed syllabus breakdown and marking scheme for major government exams',
    href: '/resources',
    color: '#16a34a',
  },
  {
    icon: Calculator,
    title: 'GATE Score Estimator',
    description: 'Estimate where your GATE score stands for PSU recruitment and M.Tech admission',
    href: '/resources/gate-calculator',
    color: '#f97316',
  },
];

export default function StudyZonePage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <h1 className="text-xl font-bold text-neutral-900">Study Zone</h1>
      <p className="text-sm text-neutral-600 mt-1">
        Everything you need to prepare for your next government exam, in one place.
      </p>

      <div className="grid md:grid-cols-2 gap-4 mt-6">
        {resources.map((resource) => {
          const Icon = resource.icon;
          return (
            <Link key={resource.href} href={resource.href}>
              <Card hoverable padding="lg" className="h-full">
                <div
                  className="w-11 h-11 rounded-lg flex items-center justify-center mb-3"
                  style={{ backgroundColor: `${resource.color}1A`, color: resource.color }}
                >
                  <Icon size={22} />
                </div>
                <p className="text-sm font-semibold text-neutral-900">{resource.title}</p>
                <p className="text-xs text-neutral-600 mt-1">{resource.description}</p>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
