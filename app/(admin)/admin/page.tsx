import Link from 'next/link';
import Card from '@/components/ui/Card';

const sections = [
  { label: 'Notifications', href: '/admin/notifications' },
  { label: 'Posts', href: '/admin/posts' },
  { label: 'Organizations', href: '/admin/organizations' },
  { label: 'States', href: '/admin/states' },
  { label: 'Categories', href: '/admin/categories' },
  { label: 'Qualifications', href: '/admin/qualifications' },
  { label: 'Admit Cards', href: '/admin/admit-cards' },
  { label: 'Results', href: '/admin/results' },
  { label: 'Answer Keys', href: '/admin/answer-keys' },
  { label: 'Documents', href: '/admin/documents' },
];

export default function AdminDashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-neutral-900 mb-1">Admin Dashboard</h1>
      <p className="text-sm text-neutral-600 mb-6">Manage all GovMatch data from here.</p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {sections.map((s) => (
          <Link key={s.href} href={s.href}>
            <Card hoverable padding="md">
              <p className="text-sm font-semibold text-neutral-900">{s.label}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
