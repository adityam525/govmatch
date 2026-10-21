import Navbar from '@/components/layout/Navbar/Navbar';
import Footer from '@/components/layout/Footer/Footer';
import HotNewsBanner from "@/components/sections/home/HotNewsBanner";
import HideOnPaths from "@/components/layout/HideOnPaths";
import DashboardNav from '@/components/layout/DashboardNav';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <HideOnPaths paths={["/"]}>
        <HotNewsBanner sticky />
      </HideOnPaths>
      <div className="flex-1 bg-neutral-50">
        <div className="mx-auto flex w-full max-w-7xl flex-col md:flex-row">
          <DashboardNav />
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
