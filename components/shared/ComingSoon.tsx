import Card from '@/components/ui/Card';

interface ComingSoonProps {
  title: string;
}

export default function ComingSoon({ title }: ComingSoonProps) {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16 text-center">
      <Card padding="lg">
        <h1 className="text-lg font-bold text-neutral-900">{title}</h1>
        <p className="text-sm text-neutral-600 mt-2">This page is coming soon.</p>
      </Card>
    </div>
  );
}
