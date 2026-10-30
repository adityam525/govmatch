import Link from 'next/link';
import { ClipboardCheck } from 'lucide-react';
import { prisma } from '@/lib/prisma';

// Shown only when at least one published mock test is linked to this job.
export default async function MockTestsLink({ notificationId, slug }: { notificationId: string; slug: string }) {
  let count = 0;
  try {
    count = await prisma.mockTest.count({ where: { notificationId, userId: null, published: true } });
  } catch { return null; }
  if (count === 0) return null;
  return (
    <Link href={`/study-zone/mock-tests?job=${encodeURIComponent(slug)}`} className="flex items-center gap-3 rounded-2xl border border-green-100 bg-green-50 p-4 shadow-sm hover:bg-green-100">
      <ClipboardCheck size={20} className="shrink-0 text-success" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-neutral-900">Practice with mock tests</p>
        <p className="text-xs text-neutral-600">{count} mock test{count === 1 ? '' : 's'} for this exam</p>
      </div>
      <span className="text-xs font-medium text-primary-600">View</span>
    </Link>
  );
}
