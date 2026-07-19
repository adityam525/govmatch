"use client";

import { useState } from "react";
import ContactHero from "@/components/sections/contact/Hero";
import ContactForm from "@/components/sections/contact/ContactForm";
import ContactInfo from "@/components/sections/contact/ContactInfo";
import SupportCards from "@/components/sections/contact/SupportCards";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const successMessage =
    "Thanks for reaching out - we'll get back to you soon.";

  return (
    <>
      <ContactHero />

      <section className="bg-neutral-50 py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <ContactForm submitted={submitted} handleSubmit={handleSubmit} />
          </div>

          <div className="lg:col-span-2">
            <ContactInfo />
          </div>
        </div>
      </section>

      <SupportCards />
    </>
  );
}
