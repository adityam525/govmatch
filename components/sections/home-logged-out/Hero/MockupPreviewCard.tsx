interface MockupJobRow {
  title: string;
  org: string;
  matchPercent: number;
}

interface MockupPreviewCardProps {
  jobs: MockupJobRow[];
}

export default function MockupPreviewCard({ jobs }: MockupPreviewCardProps) {
  return (
    <div className="bg-neutral-900 rounded-xl p-3 shadow-2xl">
      <div className="bg-white rounded-lg p-4">
        <p className="text-sm font-semibold text-neutral-900 mb-3">
          Matching Jobs for You
        </p>
        <div className="space-y-2">
          {jobs.map((job, i) => (
            <div
              key={i}
              className="flex items-center justify-between bg-neutral-50 rounded-md px-3 py-2"
            >
              <div>
                <p className="text-xs font-medium text-neutral-900">
                  {job.title}
                </p>
                <p className="text-[10px] text-neutral-400">{job.org}</p>
              </div>
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-50 text-success text-[10px] font-bold">
                {job.matchPercent}%
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* laptop base */}
      <div className="h-2 bg-neutral-800 rounded-b-xl mt-1" />
    </div>
  );
}
