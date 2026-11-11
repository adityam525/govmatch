import clsx from "clsx";

const VARIANTS = {
  body: "text-sm text-neutral-700",
  muted: "text-sm text-neutral-600",
  small: "text-xs text-neutral-600",
  caption: "text-2xs font-medium text-neutral-500",
} as const;

export default function Text({ variant = "body", as: Tag = "p", className, children }: { variant?: keyof typeof VARIANTS; as?: "p" | "span" | "div"; className?: string; children: React.ReactNode }) {
  return <Tag className={clsx(VARIANTS[variant], className)}>{children}</Tag>;
}
