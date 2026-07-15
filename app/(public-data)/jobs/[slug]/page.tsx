'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { CalendarDays, IndianRupee, Users, GraduationCap, ListChecks, ExternalLink, ArrowRight, Ruler, ShieldCheck } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAuth } from '@/features/auth/hooks';
import RecentJobsSidebar from '@/components/jobs/RecentJobsSidebar';

function formatDate(dateStr: string | null) {
  if (!dateStr) return 'To Be Announced';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
}

const LINK_LABELS: Record<string, string> = {
  APPLY_ONLINE: 'Apply Online',
  NOTIFICATION_PDF: 'Download Notification',
  OFFICIAL_WEBSITE: 'Official Website',
  ADMIT_CARD: 'Download Admit Card',
  RESULT: 'Check Result',
  SYLLABUS: 'Download Syllabus',
  SHORT_NOTICE: 'Check Short Notice',
  OTHER: 'Link',
};

export default function JobDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user, isLoggedIn } = useAuth();
  const [notification, setNotification] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    fetch('/api/notifications')
      .then((res) => res.json())
      .then((all) => setNotification(Array.isArray(all) ? all.find((n: any) => n.slug === slug) : null))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleSave = async () => {
    if (!user?.id || !notification) return;
    await fetch(`/api/users/${user.id}/saved-jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notificationId: notification.id }),
    });
    setSaved(true);
  };

  const handleMarkApplied = async () => {
    if (!user?.id || !notification) return;
    await fetch(`/api/users/${user.id}/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notificationId: notification.id, status: 'APPLIED' }),
    });
    setApplied(true);
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto px-6 py-8 text-sm text-neutral-600">Loading...</div>;
  }
  if (!notification) {
    return <div className="max-w-4xl mx-auto px-6 py-8 text-sm text-neutral-600">Job not found.</div>;
  }

  const orgName = notification.organization?.name ?? 'Unknown Organization';
  const posts = notification.posts ?? [];
  const selectionSteps: string[] = notification.selectionProcess ?? [];
  const links = notification.links ?? [];
  const advtLabel = notification.advertisementNo ? ' - Advt No: ' + notification.advertisementNo : '';

  const primaryLink = links.find((l: any) => l.linkType === "APPLY_ONLINE") || links[0];
  const officialWebsiteLink = links.find((l: any) => l.linkType === "OFFICIAL_WEBSITE")?.url || notification.officialLink;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 grid lg:grid-cols-10 gap-6 items-start">
      <div className="lg:col-span-3 lg:sticky lg:top-20">
        <RecentJobsSidebar excludeSlug={notification.slug} />
      </div>
      <div className="lg:col-span-7 space-y-6">
      <Card padding="lg">
        <h1 className="text-xl font-bold text-neutral-900">{notification.title}</h1>
        <p className="text-sm text-neutral-600 mt-1">{orgName}{advtLabel}</p>

        <div className="flex flex-wrap gap-3 mt-6">
          <a href={primaryLink?.url ?? notification.officialLink} target="_blank" rel="noopener noreferrer">
            <Button variant="primary" icon={<ExternalLink size={16} />}>Apply on Official Website</Button>
          </a>
          {isLoggedIn && (
            <>
              <Button variant="secondary" onClick={handleSave} disabled={saved}>
                {saved ? 'Saved' : 'Save Job'}
              </Button>
              <Button variant="secondary" onClick={handleMarkApplied} disabled={applied}>
                {applied ? 'Marked as Applied' : 'Mark as Applied'}
              </Button>
            </>
          )}
        </div>
      </Card>

      <Card padding="lg">
        <div className="flex items-center gap-2 mb-4">
          <CalendarDays size={18} className="text-primary-600" />
          <h2 className="text-sm font-bold text-neutral-900">Important Dates</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-neutral-400">Notification Date</p>
            <p className="text-sm font-medium text-neutral-900">{formatDate(notification.notificationDate)}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-400">Application Start</p>
            <p className="text-sm font-medium text-neutral-900">{formatDate(notification.applicationStartDate)}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-400">Application Last Date</p>
            <p className="text-sm font-medium text-danger">{formatDate(notification.applicationEndDate)}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-400">Exam Date</p>
            <p className="text-sm font-medium text-neutral-900">{formatDate(notification.examDate)}</p>
          </div>
        </div>
      </Card>

      {(notification.applicationFeeGeneral || notification.applicationFeeScSt) && (
        <Card padding="lg">
          <div className="flex items-center gap-2 mb-4">
            <IndianRupee size={18} className="text-primary-600" />
            <h2 className="text-sm font-bold text-neutral-900">Application Fee</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {notification.applicationFeeGeneral && (
              <div>
                <p className="text-xs text-neutral-400">General / OBC / EWS</p>
                <p className="text-sm font-medium text-neutral-900">{notification.applicationFeeGeneral}</p>
              </div>
            )}
            {notification.applicationFeeScSt && (
              <div>
                <p className="text-xs text-neutral-400">SC / ST / PwD</p>
                <p className="text-sm font-medium text-neutral-900">{notification.applicationFeeScSt}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      <Card padding="lg">
        <div className="flex items-center gap-2 mb-4">
          <Users size={18} className="text-primary-600" />
          <h2 className="text-sm font-bold text-neutral-900">Vacancy and Eligibility Details</h2>
        </div>
        <p className="text-xs text-neutral-600 mb-4">
          Total Vacancies: <span className="font-semibold text-neutral-900">{notification.totalVacancies}</span>
        </p>

        <div className="space-y-4">
          {posts.map((post: any) => {
            const ageRelaxation = post.ageRelaxation as Record<string, string> | null;
            const physicalCriteria = post.physicalCriteria as Record<string, string> | null;

            return (
              <div key={post.id} className="border border-neutral-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-neutral-900">{post.title}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                  <div>
                    <p className="text-[10px] text-neutral-400">Vacancies</p>
                    <p className="text-xs font-medium text-neutral-900">{post.vacancies}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-neutral-400">Qualification</p>
                    <p className="text-xs font-medium text-neutral-900">{post.qualification?.name ?? 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-neutral-400">Age Limit</p>
                    <p className="text-xs font-medium text-neutral-900">
                      {post.minAge && post.maxAge ? post.minAge + ' - ' + post.maxAge + ' years' : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-neutral-400">Pay Scale</p>
                    <p className="text-xs font-medium text-neutral-900">{post.payScale ?? 'N/A'}</p>
                  </div>
                </div>

                {post.educationDetails && (
                  <div className="mt-3 pt-3 border-t border-neutral-100">
                    <div className="flex items-center gap-1.5 mb-1">
                      <GraduationCap size={12} className="text-neutral-400" />
                      <p className="text-[10px] text-neutral-400">Education Criteria</p>
                    </div>
                    <p className="text-xs text-neutral-600">{post.educationDetails}</p>
                  </div>
                )}

                {ageRelaxation && Object.keys(ageRelaxation).length > 0 && (
                  <div className="mt-3 pt-3 border-t border-neutral-100">
                    <p className="text-[10px] text-neutral-400 mb-1.5">Age Relaxation</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(ageRelaxation).map(([category, relaxation]) => (
                        <span key={category} className="text-[10px] bg-primary-50 text-primary-600 px-2 py-1 rounded-full">
                          {category}: {relaxation}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {physicalCriteria && Object.keys(physicalCriteria).length > 0 && (
                  <div className="mt-3 pt-3 border-t border-neutral-100">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Ruler size={12} className="text-neutral-400" />
                      <p className="text-[10px] text-neutral-400">Physical Criteria</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(physicalCriteria).map(([label, value]) => (
                        <span key={label} className="text-[10px] bg-orange-50 text-accent-orange px-2 py-1 rounded-full">
                          {label}: {value}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {post.categoryWiseVacancies && (
                  <div className="mt-3 pt-3 border-t border-neutral-100">
                    <p className="text-[10px] text-neutral-400 mb-1.5">Category-wise Vacancies</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(post.categoryWiseVacancies as Record<string, number>).map(([cat, count]) => (
                        <span key={cat} className="text-[10px] bg-neutral-100 text-neutral-600 px-2 py-1 rounded-full">
                          {cat}: {count}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {selectionSteps.length > 0 && (
        <Card padding="lg">
          <div className="flex items-center gap-2 mb-4">
            <ListChecks size={18} className="text-primary-600" />
            <h2 className="text-sm font-bold text-neutral-900">Selection Process</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {selectionSteps.map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <span className="text-xs font-medium bg-primary-50 text-primary-600 px-3 py-1.5 rounded-full">
                  {i + 1}. {step}
                </span>
                {i < selectionSteps.length - 1 && <ArrowRight size={12} className="text-neutral-300" />}
              </div>
            ))}
          </div>
        </Card>
      )}

      {notification.howToApply && (
        <Card padding="lg">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck size={18} className="text-primary-600" />
            <h2 className="text-sm font-bold text-neutral-900">How to Apply</h2>
          </div>
          <p className="text-sm text-neutral-600 leading-relaxed">{notification.howToApply}</p>
        </Card>
      )}

      <Card padding="lg">
        <h2 className="text-sm font-bold text-neutral-900 mb-4">Important Links</h2>
        <div className="space-y-2">
          {links.length > 0 ? (
            links.map((link: any) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-md border border-neutral-200 hover:bg-neutral-50"
              >
                <span className="text-sm font-medium text-neutral-900">{link.label || LINK_LABELS[link.linkType]}</span>
                <ExternalLink size={14} className="text-neutral-400" />
              </a>
            ))
          ) : (
            <a
              href={notification.officialLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-md border border-neutral-200 hover:bg-neutral-50"
            >
              <span className="text-sm font-medium text-neutral-900">Official Notification / Apply Online</span>
              <ExternalLink size={14} className="text-neutral-400" />
            </a>
          )}
        </div>
      </Card>

      <Card padding="lg">
        <h2 className="text-sm font-bold text-neutral-900 mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold text-neutral-900">
              When is the last date to apply for {notification.title}?
            </p>
            <p className="text-xs text-neutral-600 mt-1">
              The application last date is {formatDate(notification.applicationEndDate)}.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-neutral-900">
              How many vacancies are there in {notification.title}?
            </p>
            <p className="text-xs text-neutral-600 mt-1">
              There are a total of {notification.totalVacancies} vacancies across {posts.length} post(s).
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-neutral-900">
              What is the official website for {orgName}?
            </p>
            <p className="text-xs text-neutral-600 mt-1">
              The official website is {officialWebsiteLink}.
            </p>
          </div>
        </div>
      </Card>
      </div>
    </div>
  );
}
