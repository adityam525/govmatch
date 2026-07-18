import SectionHeader from "@/components/ui/SectionHeader";
import FaqItem from "./FaqItem";
import { faqs } from "./data";

export default function FaqSection() {
  return (
    <section className="bg-neutral-50 py-20">
      <div className="mx-auto max-w-4xl px-4">

        <SectionHeader
          title="Frequently Asked Questions"
          description="Find answers to the most common questions about GovMatch."
          align="center"
        />

        <div className="mt-12 space-y-4">
          {faqs.map((faq) => (
            <FaqItem key={faq.question} {...faq} />
          ))}
        </div>

      </div>
    </section>
  );
}
