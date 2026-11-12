'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, BookOpen, ListChecks, FileStack, CalendarDays, Calculator } from 'lucide-react';
import Card from '@/components/ui/Card';
import Container from '@/components/layout/Container';
import PageHeader from '@/components/layout/PageHeader';
import EmptyState from '@/components/ui/EmptyState';

interface DocumentItem {
  id: string;
  title: string;
  docType: string;
  fileUrl: string;
  notification?: { title: string };
}

const docTypeConfig: Record<string, { icon: any; label: string; tone: string }> = {
  SYLLABUS: { icon: BookOpen, label: 'Syllabus', tone: 'bg-blue-50 text-blue-600' },
  EXAM_PATTERN: { icon: ListChecks, label: 'Exam Pattern', tone: 'bg-violet-50 text-violet-600' },
  SELECTION_PROCESS: { icon: FileStack, label: 'Selection Process', tone: 'bg-green-50 text-green-600' },
  PREVIOUS_PAPER: { icon: FileText, label: 'Previous Year Paper', tone: 'bg-orange-50 text-orange-600' },
  EXAM_CALENDAR: { icon: CalendarDays, label: 'Exam Calendar', tone: 'bg-amber-50 text-amber-700' },
  OTHER: { icon: FileText, label: 'Document', tone: 'bg-neutral-100 text-neutral-500' },
};

export default function ResourcesPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/documents')
      .then((r) => r.json())
      .then((d) => setDocuments(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <Container width="default" className="py-8">
      <PageHeader title="Resources" subtitle="Syllabus, exam patterns, previous papers and more." />

      <Link href="/resources/gate-calculator" className="block">
        <Card hoverable padding="md" className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-700"><Calculator size={20} aria-hidden /></div>
          <div>
            <p className="text-sm font-semibold text-neutral-900">GATE Score Estimator</p>
            <p className="text-xs text-neutral-600">Estimate where your GATE score stands</p>
          </div>
        </Card>
      </Link>

      <div className="mt-6">
        {loading ? (
          <p className="py-8 text-center text-sm text-neutral-600">Loading...</p>
        ) : documents.length === 0 ? (
          <EmptyState title="No documents published yet" description="Check back soon for syllabus, exam patterns and previous papers." />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {documents.map((doc) => {
              const config = docTypeConfig[doc.docType] ?? docTypeConfig.OTHER;
              const Icon = config.icon;
              return (
                <a key={doc.id} href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="block">
                  <Card hoverable padding="md" className="flex h-full items-start gap-3">
                    <div className={'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ' + config.tone}><Icon size={18} aria-hidden /></div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-neutral-500">{config.label}</p>
                      <p className="truncate text-sm font-semibold text-neutral-900">{doc.title}</p>
                      {doc.notification?.title && <p className="mt-0.5 truncate text-xs text-neutral-500">{doc.notification.title}</p>}
                    </div>
                  </Card>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </Container>
  );
}
