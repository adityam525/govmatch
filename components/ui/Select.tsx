'use client';

import FilterDropdown from '@/components/ui/FilterDropdown';

export interface SelectOption { value: string; label: string }

// Drop-in replacement for a native <select>. An option with value "" acts as the "nothing chosen" label.
export default function Select({
  value, onChange, options, placeholder = 'Select', widthClass = 'w-full', disabled,
}: {
  value: string; onChange: (value: string) => void; options: SelectOption[];
  placeholder?: string; widthClass?: string; disabled?: boolean;
}) {
  const empty = options.find((o) => o.value === '');
  const real = options.filter((o) => o.value !== '');
  return (
    <div className={disabled ? 'pointer-events-none opacity-50' : ''} aria-disabled={disabled}>
      <FilterDropdown
        label={empty?.label ?? placeholder}
        options={real.map((o) => ({ id: o.value, label: o.label }))}
        selected={value ? [value] : []}
        onChange={(ids) => onChange(ids[0] ?? '')}
        multi={false}
        allowClear={!!empty}
        searchable={real.length > 8}
        widthClass={widthClass}
      />
    </div>
  );
}
