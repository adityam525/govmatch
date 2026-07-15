import { Target, ShieldCheck, Users } from 'lucide-react';
import Card from '@/components/ui/Card';

const values = [
  {
    icon: Target,
    title: 'Personalized, not generic',
    description: "We match jobs to your actual profile — education, age, category — instead of showing every listing to everyone.",
  },
  {
    icon: ShieldCheck,
    title: '100% verified sources',
    description: 'Every listing is checked against its official source before it goes live on GovMatch.',
  },
  {
    icon: Users,
    title: 'Built for real aspirants',
    description: 'We built GovMatch because finding relevant government jobs — especially for specific streams like engineering — was genuinely hard.',
  },
];

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold text-neutral-900">About GovMatch</h1>
      <p className="text-sm text-neutral-600 mt-3 leading-relaxed">
  vMatch was built to solve a real problem: government job platforms in India are either generic
        listing sites that show everything to everyone, or official portals that are hard to navigate and
        don't tell you if you're actually eligible. We built a platform that matches jobs to your real
        profile, tracks your applications, and keeps you on top of every deadline — all in one place.
      </p>

      <div className="grid md:grid-cols-3 gap-4 mt-8">
        {values.map((v) => {
          const Icon = v.icon;
          return (
            <Card key={v.title} padding="lg">
              <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center mb-3">
                <Icon size={20} />
              </div>
              <p className="text-sm font-semibold text-neutral-900">{v.title}</p>
              <p className="text-xs text-neutral-600 mt-1">{v.description}</p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
