'use client';

import { useState } from 'react';
import { Mail } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const successMessage = "Thanks for reaching out - we'll get back to you soon.";

  return (
    <div className="max-w-lg mx-auto px-6 py-12">
      <Card padding="lg">
        <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center mb-3">
          <Mail size={20} />
        </div>
        <h1 className="text-lg font-bold text-neutral-900">Contact Us</h1>
        <p className="text-sm text-neutral-600 mt-1">Questions, feedback, or found an issue? Let us know.</p>

        {submitted ? (
          <p className="text-sm text-success mt-6">{successMessage}</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 mt-6">
            <input
              type="text"
              placeholder="Your name"
              required
              className="w-full text-sm border border-neutral-200 rounded-md px-3 py-2 outline-none focus:border-primary-500"
            />
            <input
              type="email"
              placeholder="Your email"
              required
              className="w-full text-sm border border-neutral-200 rounded-md px-3 py-2 outline-none focus:border-primary-500"
            />
            <textarea
              placeholder="Your message"
              required
              rows={4}
              className="w-full text-sm border border-neutral-200 rounded-md px-3 py-2 outline-none focus:border-primary-500"
            />
            <Button type="submit" variant="primary" fullWidth>Send Message</Button>
          </form>
        )}
      </Card>
    </div>
  );
}
