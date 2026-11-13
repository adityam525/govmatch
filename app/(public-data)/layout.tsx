import SiteShell from "@/components/layout/SiteShell";

export default function PublicDataLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell>{children}</SiteShell>;
}
