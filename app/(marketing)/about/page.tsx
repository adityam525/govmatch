import AboutHero from "@/components/sections/about/Hero";
import WhyGovMatchExistsSection from "@/components/sections/about/WhyGovMatchExists";
import WhyGovMatchSection from "@/components/sections/about/WhyGovMatch";
import HowItWorksSection from "@/components/sections/about/HowItWorks";
import TrustedSection from "@/components/sections/about/Trusted";
import FaqSection from "@/components/sections/about/Faq";
import BottomCTASection from "@/components/sections/about/BottomCTA";

export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <WhyGovMatchExistsSection />
      <WhyGovMatchSection />
      <HowItWorksSection />
      <TrustedSection />
      <FaqSection />
      <BottomCTASection />
    </>
  );
}
