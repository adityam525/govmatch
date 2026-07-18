type Props = {
  value: string;
  label: string;
};

export default function StatCard({
  value,
  label,
}: Props) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="text-4xl font-bold text-primary-600">
        {value}
      </div>

      <p className="mt-3 text-sm text-neutral-600">
        {label}
      </p>
    </div>
  );
}
