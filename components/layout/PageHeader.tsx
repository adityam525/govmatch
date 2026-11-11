import clsx from "clsx";

// The top of a page: h1, subtitle, optional actions. Every page should start with this.
export default function PageHeader({ title, subtitle, actions, className }: {
  title: string; subtitle?: string; actions?: React.ReactNode; className?: string;
}) {
  return (
    <header className={clsx("mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between", className)}>
      <div className="min-w-0">
        <h1 className="page-title text-neutral-900">{title}</h1>
        {subtitle && <p className="mt-1 max-w-3xl text-sm text-neutral-600">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}
