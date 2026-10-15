import Navbar from '@/components/layout/Navbar/Navbar';
import Footer from '@/components/layout/Footer/Footer';
import HotNewsBanner from "@/components/sections/home/HotNewsBanner";
import HideOnPaths from "@/components/layout/HideOnPaths";
import DashboardSidebar from '@/components/layout/DashboardSidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <HideOnPaths paths={["/"]}>
        <HotNewsBanner sticky />
      </HideOnPaths>
      <div className="flex flex-1">
        <DashboardSidebar />
        <main className="flex-1">{children}</main>
      </div>
      <Footer />
    </div>
  );
}
