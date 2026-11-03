import Link from 'next/link';
import { Check } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

const plans = [
  {
    name: 'Free',
    price: '\u20b90',
    period: 'forever',
    features: [
      'Jobs matched to your profile, with the reason for each match',
      'Save jobs and track your applications',
      'Dates and postponements for every job, in one schedule',
      'Mock tests from the study zone',
      'Your test history and score progress',
    ],
    cta: 'Get started',
    href: '/signup',
    highlighted: false,
  },
  {
    name: 'Premium',
    price: 'Not open yet',
    period: '',
    features: [
      'Everything in Free',
      'Show only jobs you are eligible for',
      'Deadline reminders on your dashboard',
      'Turn your own question papers (Word or text PDF) into private mock tests',
      'New tools as they are added',
    ],
    cta: 'Ask for access',
    href: '/contact',
    highlighted: true,
  },
];

export default function PricingPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-neutral-900">Plans</h1>
        <p className="text-sm text-neutral-600 mt-2">Free is complete for finding and tracking jobs. Premium adds tools for serious preparation.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-8">
        {plans.map((plan) => (
          <Card key={plan.name} padding="lg" className={plan.highlighted ? 'border-primary-600 border-2' : ''}>
            <p className="text-sm font-semibold text-neutral-900">{plan.name}</p>
            <p className="mt-2">
              <span className="text-2xl font-bold text-neutral-900">{plan.price}</span>
              {plan.period && <span className="text-sm text-neutral-400"> {plan.period}</span>}
            </p>
            <ul className="space-y-2 mt-5">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-xs text-neutral-600">
                  <Check size={14} className="text-success mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link href={plan.href}>
              <Button variant={plan.highlighted ? 'primary' : 'secondary'} fullWidth className="mt-6">{plan.cta}</Button>
            </Link>
          </Card>
        ))}
      </div>
      <p className="mt-6 text-center text-xs text-neutral-500">Online payment is not available yet. Write to us from the contact page and we will set up Premium on your account.</p>
    </div>
  );
}
