import clsx from "clsx";

interface DividerProps {
  label?: string;
  className?: string;
}

export default function Divider({ label, className }: DividerProps) {
  if (!label) {
    return <hr className={clsx("border-neutral-200", className)} />;
  }

  return (
    <div className={clsx("flex items-center gap-3", className)}>
      <hr className="flex-1 border-neutral-200" />
      <span className="text-xs text-neutral-400">{label}</span>
      <hr className="flex-1 border-neutral-200" />
    </div>
  );
}
