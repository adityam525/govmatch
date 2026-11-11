import clsx from "clsx";

// An icon-only button. A label is required so screen readers know what it does.
export default function IconButton({ label, icon, className, ...props }: { label: string; icon: React.ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" aria-label={label} title={label} className={clsx("inline-flex h-10 w-10 items-center justify-center rounded-md text-neutral-600 hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:opacity-50", className)} {...props}>
      {icon}
    </button>
  );
}
