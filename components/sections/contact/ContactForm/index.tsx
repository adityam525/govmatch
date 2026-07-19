"use client";

import { FormEvent } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import {
  User,
  Mail,
  MessageSquare,
  FolderOpen,
  Pencil,
  CheckCircle2,
} from "lucide-react";

type Props = {
  submitted: boolean;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
};

export default function ContactForm({
  submitted,
  handleSubmit,
}: Props) {
  return (
    <Card padding="lg" className="rounded-3xl shadow-sm border border-neutral-200">

      <h2 className="text-2xl font-bold">
        Send us a Message
      </h2>

      <p className="text-neutral-600 mt-2">
        Fill out the form below and our team will get back to you shortly.
      </p>

      {submitted ? (
        <div className="py-16 flex flex-col items-center text-center">

          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
            <CheckCircle2
              className="text-green-600"
              size={42}
            />
          </div>

          <h3 className="text-2xl font-semibold">
            Message Sent Successfully
          </h3>

          <p className="mt-4 text-neutral-600 max-w-md">
            Thanks for contacting GovMatch.
            Our support team usually replies within
            24 hours.
          </p>

        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5"
        >
          <div className="grid gap-5 md:grid-cols-2">

            <div>
              <label className="mb-2 block text-sm font-medium">
                Full Name
              </label>

              <div className="relative">

                <User
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                />

                <input
                  required
                  type="text"
                  placeholder="John Doe"
                  className="h-12 w-full rounded-xl border border-neutral-200 pl-11 pr-4 outline-none transition focus:border-primary-500"
                />

              </div>
            </div>

            <div>

              <label className="mb-2 block text-sm font-medium">
                Email Address
              </label>

              <div className="relative">

                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                />

                <input
                  required
                  type="email"
                  placeholder="you@example.com"
                  className="h-12 w-full rounded-xl border border-neutral-200 pl-11 pr-4 outline-none transition focus:border-primary-500"
                />

              </div>

            </div>

          </div>

          <div className="grid gap-5 md:grid-cols-2">

            <div>

              <label className="mb-2 block text-sm font-medium">
                Subject
              </label>

              <div className="relative">

                <Pencil
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                />

                <input
                  type="text"
                  placeholder="How can we help?"
                  className="h-12 w-full rounded-xl border border-neutral-200 pl-11 pr-4 outline-none transition focus:border-primary-500"
                />

              </div>

            </div>

            <div>

              <label className="mb-2 block text-sm font-medium">
                Category
              </label>

              <div className="relative">

                <FolderOpen
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                />

                <select
                  className="h-12 w-full rounded-xl border border-neutral-200 pl-11 pr-4 outline-none transition focus:border-primary-500"
                >
                  <option>General Inquiry</option>
                  <option>Technical Support</option>
                  <option>Government Jobs</option>
                  <option>Feature Request</option>
                  <option>Report a Bug</option>
                  <option>Partnership</option>
                </select>

              </div>

            </div>

          </div>

          <div>

            <label className="mb-2 block text-sm font-medium">
              Message
            </label>

            <div className="relative">

              <MessageSquare
                size={18}
                className="absolute left-4 top-5 text-neutral-400"
              />

              <textarea
                required
                rows={7}
                placeholder="Tell us how we can help..."
                className="w-full rounded-xl border border-neutral-200 pl-11 pr-4 pt-4 outline-none transition focus:border-primary-500"
              />

            </div>

          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
          >
            Send Message
          </Button>

        </form>
      )}

    </Card>
  );
}
