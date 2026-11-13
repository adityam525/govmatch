import clsx from "clsx";

const LEVELS = {
  page: { tag: "h1", cls: "page-title" },
  section: { tag: "h2", cls: "section-title" },
  card: { tag: "h3", cls: "text-base font-semibold" },
} as const;

export default function Heading({ level = "section", className, children }: { level?: keyof typeof LEVELS; className?: string; children: React.ReactNode }) {
  const { tag: Tag, cls } = LEVELS[level];
  return <Tag className={clsx(cls, "text-neutral-900", className)}>{children}</Tag>;
}
