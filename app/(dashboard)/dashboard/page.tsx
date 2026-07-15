'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Briefcase, Bookmark, ClipboardList, TrendingUp } from 'lucide-react';
import Card from '@/components/ui/Card';
import { useAuth } from '@/features/auth/hooks';
import { useJobMatches } from '@/features/matching/hooks';

export default function DashboardPage() {
  const { user, isLoggedIn, loading: authLoading } = useAuth();
  const { matches, loading: matchesLoading } = useJobMatches();
  const [savedCount, setSavedCount] = useState(0);
  const [applicationsCount, setApplicationsCount] = useState(0);
  const [profileStrength, setProfileStrength] = useState(0);

  useEffect(() => {
    if (!user?.id) return;
    fetch(`/api/users/${user.id}/saved-jobs`).then((r) => r.json()).then((d) => setSavedCount(Array.isArray(d) ? d.length : 0)).catch(() => {});
    fetch(`/api/users/${user.id}/applications`).then((r) => r.json()).then((d) => setApplicationsCount(Array.isArray(d) ? d.length : 0)).catch(() => {});
    fetch(`/api/users/${user.id}/profile`).then((r) => r.json()).then((d) => setProfileStrength(d?.profileStrength ?? 0)).catch(() => {});
  }, [user?.id]);

  if (authLoading) return <div className="max-w-5xl mx-auto px-6 py-8 text-sm text-neutral-600">Loading...</div>;
  if (!isLoggedIn) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Card padding="lg"><p className="text-sm text-neutral-600">Please log in to view your dashboard.</p></Card>
      </div>
    );
  }

  const topMatches = matches.slice(0, 3);

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <h1 className="text-xl font-bold text-neutral-900">Welcome back, {user?.name?.split(' ')[0] ?? 'there'}</h1>
      <p className="text-sm text-neutral-600 mt-1">Here's what's happening with your job search.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
              <TrendingUp size={18} />
            </div>
            <div>
              <p className="text-lg font-bold text-neutral-900">{profileStrength}%</p>
              <p className="text-xs text-neutral-600">Profile Strength</p>
            </div>
          </div>
        </Card>
        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 text-success flex items-center justify-center">
              <Briefcase size={18} />
            </div>
            <div>
              <p className="text-lg font-bold text-neutral-900">{matchesLoading ? '-' : matches.length}</p>
              <p className="text-xs text-neutral-600">Matched Jobs</p>
            </div>
          </div>
        </Card>
        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent-purple/10 text-accent-purple flex items-center justify-center">
              <Bookmark size={18} />
            </div>
            <div>
              <p className="text-lg font-bold text-neutral-900">{savedCount}</p>
              <p className="text-xs text-neutral-600">Saved Jobs</p>
            </div>
          </div>
        </Card>
        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent-orange/10 text-accent-orange flex items-center justify-center">
              <ClipboardList size={18} />
            </div>
            <div>
              <p className="text-lg font-bold text-neutral-900">{applicationsCount}</p>
              <p className="text-xs text-neutral-600">Applications</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <Card padding="lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-neutral-900">Top Matches</h2>
            <Link href="/jobs" className="text-xs font-medium text-primary-600 hover:underline">View All</Link>
          </div>
          {matchesLoading ? (
            <p className="text-xs text-neutral-400 py-4 text-center">Loading...</p>
          ) : topMatches.length === 0 ? (
            <p className="text-xs text-neutral-400 py-4 text-center">
              Complete your profile to get personalized matches.
            </p>
          ) : (
            <div className="space-y-2">
              {topMatches.map((m) => (
                <Link
                  key={m.postId}
                  href={`/jobs/${m.slug}`}
                  className="flex items-center justify-between p-2 rounded-md hover:bg-neutral-50"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-neutral-900 truncate">{m.postTitle}</p>
                    <p className="text-[10px] text-neutral-400">{m.organization}</p>
                  </div>
                  <span className="text-xs font-bold text-success shrink-0 ml-2">{m.matchScore}%</span>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card padding="lg">
          <h2 className="text-sm font-bold text-neutral-900 mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <Link href="/profile" className="block p-2.5 rounded-md border border-neutral-200 hover:bg-neutral-50 text-xs font-medium text-neutral-900">
              Complete your profile
            </Link>
            <Link href="/saved-jobs" className="block p-2.5 rounded-md border border-neutral-200 hover:bg-neutral-50 text-xs font-medium text-neutral-900">
              View saved jobs
            </Link>
            <Link href="/applications" className="block p-2.5 rounded-md border border-neutral-200 hover:bg-neutral-50 text-xs font-medium text-neutral-900">
              Track applications
            </Link>
            <Link href="/jobs" className="block p-2.5 rounded-md border border-neutral-200 hover:bg-neutral-50 text-xs font-medium text-neutral-900">
              Browse all jobs
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
