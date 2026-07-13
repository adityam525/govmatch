import { ReactNode } from "react";
import clsx from "clsx";

interface TagProps {
  children: ReactNode;
  color?: string; // pass a hex from categoryColors, or omit for default
  className?: string;
}

export default function Tag({ children, color, className }: TagProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
        className,
      )}
      style={
        color
          ? { backgroundColor: `${color}1A`, color } // ~10% opacity bg tint
          : undefined
      }
    >
      {children}
    </span>
  );
}
