import Navbar from "@/components/layout/Navbar/Navbar";
import Footer from "@/components/layout/Footer/Footer";
import HotNewsBanner from "@/components/sections/home/HotNewsBanner";
import HideOnPaths from "@/components/layout/HideOnPaths";

export default function PublicDataLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <HideOnPaths paths={["/"]}>
        <HotNewsBanner sticky />
      </HideOnPaths>
      <main>{children}</main>
      <Footer />
    </>
  );
}
