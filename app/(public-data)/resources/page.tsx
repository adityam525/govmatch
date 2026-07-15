'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, BookOpen, ListChecks, FileStack, CalendarDays, Calculator } from 'lucide-react';
import Card from '@/components/ui/Card';

interface DocumentItem {
  id: string;
  title: string;
  docType: string;
  fileUrl: string;
  notification?: { title: string };
}

const docTypeConfig: Record<string, { icon: any; label: string; color: string }> = {
  SYLLABUS: { icon: BookOpen, label: 'Syllabus', color: '#2563eb' },
  EXAM_PATTERN: { icon: ListChecks, label: 'Exam Pattern', color: '#7c3aed' },
  SELECTION_PROCESS: { icon: FileStack, label: 'Selection Process', color: '#16a34a' },
  PREVIOUS_PAPER: { icon: FileText, label: 'Previous Year Paper', color: '#f97316' },
  EXAM_CALENDAR: { icon: CalendarDays, label: 'Exam Calendar', color: '#ca8a04' },
  OTHER: { icon: FileText, label: 'Document', color: '#94a3b8' },
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
    <div className="max-w-5xl mx-auto px-6 py-8">
      <h1 className="text-xl font-bold text-neutral-900">Resources</h1>
      <p className="text-sm text-neutral-600 mt-1">Syllabus, exam patterns, previous papers and more.</p>

      <Link href="/resources/gate-calculator">
        <Card hoverable padding="md" className="mt-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-50 text-accent-orange flex items-center justify-center shrink-0">
            <Calculator size={20} />
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-900">GATE Score Estimator</p>
            <p className="text-xs text-neutral-600">Estimate where your GATE score stands</p>
          </div>
        </Card>
      </Link>

      <div className="mt-6">
        {loading ? (
          <p className="text-sm text-neutral-600 py-8 text-center">Loading...</p>
        ) : documents.length === 0 ? (
          <Card padding="lg">
            <p className="text-sm text-neutral-600 text-center py-8">
              No documents published yet. Check back soon for syllabus, exam patterns, and previous papers.
            </p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-3">
            {documents.map((doc) => {
              const config = docTypeConfig[doc.docType] ?? docTypeConfig.OTHER;
              const Icon = config.icon;
              return (
                <a key={doc.id} href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                  <Card hoverable padding="md" className="flex items-start gap-3 h-full">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${config.color}1A`, color: config.color }}
                    >
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-neutral-400">{config.label}</p>
                      <p className="text-sm font-semibold text-neutral-900 truncate">{doc.title}</p>
                      {doc.notification?.title && (
                        <p className="text-xs text-neutral-400 truncate mt-0.5">{doc.notification.title}</p>
                      )}
                    </div>
                  </Card>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
