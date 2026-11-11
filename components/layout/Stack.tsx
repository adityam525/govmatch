import clsx from "clsx";

const GAPS = { sm: "space-y-2", md: "space-y-4", lg: "space-y-6", xl: "space-y-8" } as const;

// Vertical rhythm inside a block. "sections" is the big page-level gap (48 / 80 / 128px).
export default function Stack({ gap = "md", sections = false, className, children }: {
  gap?: keyof typeof GAPS; sections?: boolean; className?: string; children: React.ReactNode;
}) {
  return <div className={clsx(sections ? "section-stack" : GAPS[gap], className)}>{children}</div>;
}
