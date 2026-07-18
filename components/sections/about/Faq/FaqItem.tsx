"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

type Props = {
  question: string;
  answer: string;
};

export default function FaqItem({ question, answer }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white transition-all">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-6 py-5 text-left"
      >
        <span className="text-base font-semibold text-neutral-900">
          {question}
        </span>

        <ChevronDown
          size={20}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="border-t border-neutral-100 px-6 py-5">
          <p className="text-sm leading-7 text-neutral-600">
            {answer}
          </p>
        </div>
      )}
    </div>
  );
}
