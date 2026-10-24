import Navbar from '@/components/layout/Navbar/Navbar';
import Footer from '@/components/layout/Footer/Footer';
import HotNewsBanner from "@/components/sections/home/HotNewsBanner";
import HideOnPaths from "@/components/layout/HideOnPaths";
import DashboardNav from '@/components/layout/DashboardNav';
import AppShell from '@/components/layout/AppShell';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <HideOnPaths paths={["/"]}>
        <HotNewsBanner sticky />
      </HideOnPaths>
      <AppShell nav={<DashboardNav />}>{children}</AppShell>
      <Footer />
    </div>
  );
}
