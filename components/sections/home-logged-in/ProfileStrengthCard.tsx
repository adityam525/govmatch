import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useAuth } from "@/features/auth/hooks";

export default function ProfileStrengthCard() {
  const { user } = useAuth();
  const strength = user?.profileStrength ?? 0;

  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (strength / 100) * circumference;

  return (
    <Card padding="lg">
      <div className="flex items-center gap-4">
        <div>
          <p className="text-sm font-bold text-neutral-900">Profile Strength</p>
          <p className="text-xs text-neutral-600 mt-1">
            Complete your profile to get better job matches
          </p>
        </div>
        <div className="relative w-16 h-16 shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
            <circle
              cx="32"
              cy="32"
              r={radius}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="6"
            />
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
            <span className="text-sm font-bold text-neutral-900">
              {strength}%
            </span>
          </div>
        </div>
      </div>

      <Link href="/profile">
        <Button variant="primary" size="md" fullWidth className="mt-4">
          Complete Profile
        </Button>
      </Link>
    </Card>
  );
}
