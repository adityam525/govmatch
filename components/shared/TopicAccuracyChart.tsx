interface TopicScore {
  label: string;
  percent: number; // 0-100
}

const topics: TopicScore[] = [
  { label: "Quant", percent: 55 },
  { label: "Reasoning", percent: 82 },
  { label: "English", percent: 40 },
  { label: "GK", percent: 68 },
  { label: "Comp.", percent: 75 },
];

export default function TopicAccuracyChart() {
  return (
    <div className="bg-white rounded-xl p-5 w-full max-w-xs">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-neutral-900">
          Topic-wise accuracy
        </span>
        <span className="text-xs text-neutral-400">Last 30 days</span>
      </div>

      <div className="flex items-end justify-between gap-2 h-32">
        {topics.map((topic) => (
          <div
            key={topic.label}
            className="flex-1 flex flex-col items-center gap-2"
          >
            <div className="w-full flex items-end h-24">
              <div
                className="w-full bg-accent-amber rounded-t-md"
                style={{ height: `${topic.percent}%` }}
              />
            </div>
            <span className="text-[10px] text-neutral-400">{topic.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
