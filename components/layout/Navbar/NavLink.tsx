"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

interface NavLinkProps {
  href: string;
  children: string;
}

export default function NavLink({ href, children }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={clsx(
        "text-sm font-medium transition-colors",
        isActive
          ? "text-primary-600"
          : "text-neutral-600 hover:text-neutral-900",
      )}
    >
      {children}
    </Link>
  );
}
