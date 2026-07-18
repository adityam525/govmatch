import Badge from "@/components/ui/Badge";
import Breadcrumb from "./Breadcrumb";
import AboutHeroButtons from "./AboutHeroButtons";

export default function AboutHeroContent() {
  return (
    <>
      <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 leading-tight">
        Helping Aspirants Discover
        <span className="text-primary-600 block">
          The Right Government Career
        </span>
      </h1>

      <p className="mt-6 text-lg text-neutral-600 max-w-2xl leading-relaxed">
        GovMatch simplifies the government job journey by helping students,
        graduates, and professionals discover opportunities that match their
        qualifications, interests, and career goals.
      </p>

      <p className="mt-4 text-neutral-500 max-w-2xl">
        From notifications and exam updates to AI-powered recommendations,
        preparation resources, and application tracking — everything in one
        place.
      </p>

      <AboutHeroButtons />
    </>
  );
}
