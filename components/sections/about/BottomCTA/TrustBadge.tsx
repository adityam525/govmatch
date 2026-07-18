import { CheckCircle2 } from "lucide-react";

type Props = {
  text: string;
};

export default function TrustBadge({ text }: Props) {
  return (
    <div className="flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm text-white backdrop-blur">
      <CheckCircle2 size={18} className="text-green-300" />
      <span>{text}</span>
    </div>
  );
}
