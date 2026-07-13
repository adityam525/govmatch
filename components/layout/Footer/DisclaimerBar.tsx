import { ShieldCheck } from "lucide-react";

export default function DisclaimerBar() {
  return (
    <div className="bg-primary-50 border-t border-primary-100 py-3">
      <p className="flex items-center justify-center gap-2 text-xs text-primary-700 text-center px-4">
        <ShieldCheck size={14} className="shrink-0" />
        We collect information from official sources only. No false promises,
        only genuine opportunities.
      </p>
    </div>
  );
}
