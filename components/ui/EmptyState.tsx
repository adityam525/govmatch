import clsx from "clsx";

export default function EmptyState({ title, description, action, className }: { title: string; description?: string; action?: React.ReactNode; className?: string }) {
  return (
    <div className={clsx("rounded-2xl border border-dashed border-neutral-300 bg-white p-6 text-center", className)}>
      <p className="text-sm font-semibold text-neutral-900">{title}</p>
      {description && <p className="mx-auto mt-1 max-w-md text-sm text-neutral-600">{description}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}
