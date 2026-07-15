'use client';

import { useState } from 'react';
import { Calculator } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface ScoreBand {
  min: number;
  max: number;
  label: string;
  description: string;
  color: string;
}

const bands: ScoreBand[] = [
  { min: 750, max: 1000, label: 'Excellent', description: 'Strong contender for top PSU recruitment (ONGC, BHEL, NTPC) and IISc/IIT M.Tech admission', color: '#16a34a' },
  { min: 600, max: 749, label: 'Very Good', description: 'Competitive for most PSU recruitment drives and IIT/NIT M.Tech programs', color: '#2563eb' },
  { min: 450, max: 599, label: 'Good', description: 'Eligible for many NIT M.Tech programs and some PSU shortlists', color: '#ca8a04' },
  { min: 300, max: 449, label: 'Moderate', description: 'May qualify for state-level institutes and select PSU categories', color: '#f97316' },
  { min: 0, max: 299, label: 'Below Typical Cutoffs', description: 'Below most recent PSU/M.Tech cutoff ranges — check specific notification for exact requirements', color: '#dc2626' },
];

export default function GateCalculatorPage() {
  const [score, setScore] = useState('');
  const [result, setResult] = useState<ScoreBand | null>(null);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const numScore = Number(score);
    if (!numScore || numScore < 0 || numScore > 1000) {
      setResult(null);
      return;
    }
    const band = bands.find((b) => numScore >= b.min && numScore <= b.max) ?? null;
    setResult(band);
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <Card padding="lg">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
            <Calculator size={20} />
          </div>
          <h1 className="text-lg font-bold text-neutral-900">GATE Sce Estimator</h1>
        </div>
        <p className="text-sm text-neutral-600 mt-2">
          Get a rough sense of where your GATE score typically stands. This is a general estimate based on
          historical trends, not an official prediction — always verify against the specific notification's
          actual cutoff requirements.
        </p>

        <form onSubmit={handleCalculate} className="flex gap-2 mt-6">
          <input
            type="number"
            min="0"
            max="1000"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            placeholder="Enter your GATE score (0-1000)"
            className="flex-1 text-sm border border-neutral-200 rounded-md px-3 py-2 outline-none focus:border-primary-500"
          />
          <Button type="submit" variant="primary">Estimate</Button>
        </form>

        {result && (
          <div className="mt-6 p-4 rounded-lg border" style={{ borderColor: result.color, backgroundColor: `${result.color}0D` }}>           <p className="text-sm font-bold" style={{ color: result.color }}>{result.label}</p>
            <p className="text-xs text-neutral-600 mt-1">{result.description}</p>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-neutral-100">
          <p className="text-xs font-semibold text-neutral-900 mb-3">Score Bands Reference</p>
          <div className="space-y-2">
            {bands.map((band) => (
              <div key={band.label} className="flex items-center justify-between text-xs">
                <span className="text-neutral-600">{band.min}-{band.max}</span>
                <span className="font-medium" style={{ color: band.color }}>{band.label}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
