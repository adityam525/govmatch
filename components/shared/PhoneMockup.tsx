import { Bell, Briefcase } from "lucide-react";

interface PhoneMockupProps {
  score?: number;
}

export default function PhoneMockup({ score = 78 }: PhoneMockupProps) {
  return (
    <div className="w-64 bg-neutral-900 rounded-[2.5rem] p-2 shadow-2xl mx-auto">
      <div className="bg-white rounded-[2rem] overflow-hidden">
        {/* Status bar */}
        <div className="flex items-center justify-between px-5 pt-3 pb-2">
          <span className="text-[10px] font-semibold text-neutral-900">
            9:41
          </span>
          <div className="flex gap-1">
            <div className="w-3 h-1.5 bg-neutral-900 rounded-sm" />
            <div className="w-3 h-1.5 bg-neutral-900 rounded-sm" />
          </div>
        </div>

        {/* App header */}
        <div className="px-5 pb-3 flex items-center justify-between border-b border-neutral-100">
          <p className="text-sm font-bold text-neutral-900">GovMatch</p>
          <div className="relative">
            <Bell size={16} className="text-neutral-600" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-danger rounded-full border border-white" />
          </div>
        </div>

        {/* Notification card */}
        <div className="px-4 pt-4">
          <div className="bg-primary-50 border border-primary-100 rounded-xl p-3 mb-3">
            <p className="text-[11px] font-semibold text-primary-700">
              New match found!
            </p>
            <p className="text-[10px] text-neutral-600 mt-0.5">
              ISRO Scientist/Engineer &apos;SC&apos;
            </p>
          </div>

          {/* Match score stamp */}
          <div className="flex flex-col items-center py-4">
            <div className="w-20 h-20 rounded-full border-4 border-accent-amber flex items-center justify-center bg-amber-50">
              <span className="text-lg font-bold text-accent-amber">
                {score}%
              </span>
            </div>
            <p className="text-[10px] text-neutral-400 mt-2">
              Your Match Score
            </p>
          </div>

          {/* Job list preview */}
          <div className="space-y-2 pb-4">
            {[
              { title: "RRB Junior Engineer", tag: "92%" },
              { title: "IBPS Clerk 2025", tag: "85%" },
            ].map((job) => (
              <div
                key={job.title}
                className="flex items-center justify-between bg-neutral-50 rounded-lg px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-neutral-200 flex items-center justify-center shrink-0">
                    <Briefcase size={12} className="text-neutral-500" />
                  </div>
                  <span className="text-[10px] font-medium text-neutral-900">
                    {job.title}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-success">
                  {job.tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
