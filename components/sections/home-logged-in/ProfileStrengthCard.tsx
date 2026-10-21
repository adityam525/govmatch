import Link from 'next/link';
import Button from '@/components/ui/Button';

interface ProfileStrengthCardProps {
  strength: number;
}

export default function ProfileStrengthCard({ strength }: ProfileStrengthCardProps) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (strength / 100) * circumference;

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-neutral-900">Profile Strength</p>
          <p className="mt-1 text-xs text-neutral-600">Complete your profile to get better job matches</p>
        </div>
        <div className="relative h-16 w-16 shrink-0">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="6" />
            <circle
              cx="32"
              cy="32"
              r={radius}
              fill="none"
              stroke="#2563eb"
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold text-neutral-900">{strength}%</span>
          </div>
        </div>
      </div>
      <Link href="/profile">
        <Button variant="primary" size="md" fullWidth className="mt-4">
          Complete Profile
        </Button>
      </Link>
    </div>
  );
}
