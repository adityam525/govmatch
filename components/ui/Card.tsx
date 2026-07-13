import { HTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: "sm" | "md" | "lg";
  hoverable?: boolean;
}

const paddingStyles = { sm: "p-4", md: "p-6", lg: "p-8" };

export default function Card({
  children,
  padding = "md",
  hoverable = false,
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={clsx(
        "bg-white border border-neutral-200 rounded-lg shadow-card",
        paddingStyles[padding],
        hoverable && "transition-shadow hover:shadow-lg",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
