import Link from 'next/link';
import { Check } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

const plans = [
  {
    name: 'Free',
    price: '\u20b90',
    period: 'forever',
    features: ['Personalized job matching', 'Save unlimited jobs', 'Application tracker', 'Email alerts for new matches'],
    cta: 'Get Started',
    href: '/signup',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '\u20b999',
    period: '/month',
    features: ['Everything in Free', 'Full mock test access', 'Downloadable mock papers', 'Priority deadline alerts', 'Detailed performance analytics'],
    cta: 'Coming Soon',
    href: '/signup',
    highlighted: true,
  },
];

export default function PricingPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-neutral-900">Simple, transparent pricing</h1>
        <p className="text-sm text-neutral-600 mt-2">Start free. Upgrade when you need more prep resources.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-8">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            padding="lg"
            className={plan.highlighted ? 'border-primary-600 border-2' : ''}
          >
            <p className="text-sm font-semibold text-neutral-900">{plan.name}</p>
            <p className="mt-2">
              <span className="text-2xl font-bold text-neutral-900">{plan.price}</span>
              <span className="text-sm text-neutral-400"> {plan.period}</span>
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
              <Button variant={plan.highlighted ? 'primary' : 'secondary'} fullWidth className="mt-6">
                {plan.cta}
              </Button>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
