import clsx from "clsx";

const WIDTHS = { narrow: "max-w-3xl", default: "max-w-5xl", wide: "max-w-7xl" } as const;

// The one place that sets page width and side padding.
export default function Container({ width = "wide", className, children, as: Tag = "div" }: {
  width?: keyof typeof WIDTHS; className?: string; children: React.ReactNode; as?: "div" | "main" | "section";
}) {
  return <Tag className={clsx("page-x mx-auto w-full", WIDTHS[width], className)}>{children}</Tag>;
}
