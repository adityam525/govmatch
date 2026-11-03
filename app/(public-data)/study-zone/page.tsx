import Link from 'next/link';
import { ClipboardList, FileText, BookOpen, Calculator } from 'lucide-react';
import Card from '@/components/ui/Card';

const live = [
  { icon: ClipboardList, title: 'Mock Tests', description: 'Practice tests with an exam-style screen, timer and detailed results', href: '/study-zone/mock-tests', color: '#2563eb' },
  { icon: Calculator, title: 'GATE Score Estimator', description: 'Estimate where your GATE score stands for PSU recruitment and M.Tech admission', href: '/resources/gate-calculator', color: '#f97316' },
];
const soon = [
  { icon: FileText, title: 'Previous Year Papers', description: 'Questions from earlier exams, tagged by exam', color: '#7c3aed' },
  { icon: BookOpen, title: 'Syllabus & Exam Pattern', description: 'Syllabus and marking scheme for major exams', color: '#16a34a' },
];

export default function StudyZonePage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <h1 className="text-xl font-bold text-neutral-900">Study Zone</h1>
      <p className="text-sm text-neutral-600 mt-1">Tools to help you prepare for your next government exam.</p>

      <div className="grid md:grid-cols-2 gap-4 mt-6">
        {live.map((r) => {
          const Icon = r.icon;
          return (
            <Link key={r.href} href={r.href}>
              <Card hoverable padding="lg" className="h-full">
                <div className="w-11 h-11 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: `${r.color}1A`, color: r.color }}><Icon size={22} /></div>
                <p className="text-sm font-semibold text-neutral-900">{r.title}</p>
                <p className="text-xs text-neutral-600 mt-1">{r.description}</p>
              </Card>
            </Link>
          );
        })}
        {soon.map((r) => {
          const Icon = r.icon;
          return (
            <Card key={r.title} padding="lg" className="h-full opacity-70">
              <div className="w-11 h-11 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: `${r.color}1A`, color: r.color }}><Icon size={22} /></div>
              <p className="text-sm font-semibold text-neutral-900">{r.title} <span className="ml-1 rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-500">Coming soon</span></p>
              <p className="text-xs text-neutral-600 mt-1">{r.description}</p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
