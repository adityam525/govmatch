import Link from "next/link";

interface PerfectMatchCardProps {
  count: number;
  profileComplete: boolean;
  href: string;
}

export default function PerfectMatchCard({ count, profileComplete, href }: PerfectMatchCardProps) {
  return (
    <Link href={href} className="block w-48 rounded-xl border border-neutral-200 bg-white p-4 shadow-lg transition hover:border-primary-300">
      <p className="text-xs font-medium text-neutral-600">Perfect matches</p>
      {profileComplete ? (
        <>
          <p className="mt-2 text-center text-4xl font-bold text-neutral-900">{count}</p>
          <p className="mt-1 text-center text-xs font-medium text-success">{count === 1 ? "open job fits you 100%" : "open jobs fit you 100%"}</p>
        </>
      ) : (
        <p className="mt-2 text-center text-xs text-neutral-600">Add your education and date of birth to see your matches.</p>
      )}
    </Link>
  );
}
