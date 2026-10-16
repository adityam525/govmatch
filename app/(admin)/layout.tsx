"use client";

import { usePathname } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import Footer from "@/components/layout/Footer/Footer";
import Navbar from "@/components/layout/Navbar/Navbar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex min-w-0 flex-1 flex-col bg-neutral-50 md:flex-row">
        <AdminSidebar />
        <main className="min-w-0 flex-1">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
