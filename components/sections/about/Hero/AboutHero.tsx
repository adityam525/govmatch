import AboutHeroContent from "./AboutHeroContent";
import HeroIllustration from "@/components/sections/home-logged-out/Hero/HeroIllustration";

export default function AboutHero() {
  return (
    <section className="py-16 lg:py-24 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="max-w-2xl">
            <AboutHeroContent />
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-[580px]">
              <HeroIllustration />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
