interface MatchScoreCardProps {
  score: number;
  label?: string;
}

export default function MatchScoreCard({
  score,
  label = "Very Good Match",
}: MatchScoreCardProps) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="bg-white border border-neutral-200 rounded-xl shadow-lg p-4 w-48">
      <p className="text-xs font-medium text-neutral-600 mb-2">
        Your Match Score
      </p>
      <div className="relative w-24 h-24 mx-auto">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="#2563eb"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-neutral-900">{score}%</span>
        </div>
      </div>
      <p className="text-xs font-medium text-success text-center mt-2">
        {label}
      </p>
    </div>
  );
}
