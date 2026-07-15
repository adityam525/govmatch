import Link from 'next/link';
import { ClipboardList, Lock } from 'lucide-react';
import Card from '@/components/ui/Card';

const mockTestSeries = [
  { id: 'ssc-cgl', title: 'SSC CGL Full Mock Test Series', questions: 100, duration: '60 min', exams: 10 },
  { id: 'ibps-po', title: 'IBPS PO Prelims Mock Series', questions: 100, duration: '60 min', exams: 8 },
  { id: 'rrb-technician', title: 'RRB Technician Mock Series', questions: 75, duration: '90 min', exams: 6 },
  { id: 'ssc-mts', title: 'SSC MTS Mock Test Series', questions: 90, duration: '45 min', exams: 5 },
];

export default function MockTestsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-xl font-bold text-neutral-900">Mock Tests</h1>
      <p className="text-sm text-neutral-600 mt-1">
        Practice with exam-pattern mock tests. Full test-taking experience launching soon.
      </p>

      <div className="grid md:grid-cols-2 gap-4 mt-6">
        {mockTestSeries.map((series) => (
          <Card key={series.id} padding="lg">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
                <ClipboardList size={20} />
              </div>
              <span className="flex items-center gap-1 text-[10px] font-medium text-neutral-400 bg-neutral-100 px-2 py-1 rounded-full">
                <Lock size={10} /> Coming Soon
              </span>
            </div>
            <p className="text-sm font-semibold text-neutral-900 mt-3">{series.title}</p>
            <p className="text-xs text-neutral-600 mt-1">
              {series.exams} tests · {series.questions} questions · {series.duration}
            </p>
          </Card>
        ))}
      </div>

      <Card padding="lg" className="mt-6 bg-neutral-50 border-dashed">
        <p className="text-sm text-neutral-600 text-center">
          Want early acss when mock tests launch?{' '}
          <Link href="/signup" className="text-primary-600 font-medium hover:underline">Sign up</Link>
          {' '}to get notified.
        </p>
      </Card>
    </div>
  );
}
