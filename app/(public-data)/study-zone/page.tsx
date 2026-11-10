import Link from 'next/link';
import { ClipboardList, FileText, BookOpen, Calculator, Image as ImageIcon } from 'lucide-react';
import Card from '@/components/ui/Card';

// Full class names, so Tailwind can see them.
const TONES = {
  blue: 'bg-blue-50 text-blue-600',
  violet: 'bg-violet-50 text-violet-600',
  green: 'bg-green-50 text-green-600',
  orange: 'bg-orange-50 text-orange-600',
  teal: 'bg-teal-50 text-teal-600',
  pink: 'bg-pink-50 text-pink-600',
} as const;

const cards = [
  { icon: ClipboardList, title: 'Mock Tests', description: 'Practice tests with an exam-style screen, timer and detailed results', href: '/study-zone/mock-tests', tone: 'blue' },
  { icon: ClipboardList, title: 'Practice by topic', description: 'Build a set from the question bank, with fresh numbers every time', href: '/study-zone/practice', tone: 'teal' },
  { icon: FileText, title: 'Previous Year Papers', description: 'Question papers from earlier exams, as they are added', href: '/resources', tone: 'violet' },
  { icon: BookOpen, title: 'Syllabus & Exam Pattern', description: 'Syllabus and marking scheme for exams, as they are added', href: '/resources', tone: 'green' },
  { icon: Calculator, title: 'GATE Score Estimator', description: 'Estimate where your GATE score stands for PSU recruitment and M.Tech admission', href: '/resources/gate-calculator', tone: 'orange' },
  { icon: ImageIcon, title: 'Photo and signature resizer', description: 'Fit your photo or signature to the exact size an application form asks for', href: '/tools/photo-resizer', tone: 'pink' },
] as const;

export default function StudyZonePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="text-xl font-bold text-neutral-900">Study Zone</h1>
      <p className="mt-1 text-sm text-neutral-600">Tools to help you prepare for your next government exam.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((r) => {
          const Icon = r.icon;
          return (
            <Link key={r.title} href={r.href} className="block">
              <Card hoverable padding="lg" className="h-full">
                <div className={'mb-3 flex h-11 w-11 items-center justify-center rounded-lg ' + TONES[r.tone]}><Icon size={22} aria-hidden /></div>
                <p className="text-sm font-semibold text-neutral-900">{r.title}</p>
                <p className="mt-1 text-xs text-neutral-600">{r.description}</p>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
