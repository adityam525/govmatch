'use client';

export type FieldType = 'text' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox' | 'relation';

export interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: { label: string; value: string }[];
  relationEndpoint?: string;
  placeholder?: string;
}

interface FormFieldProps {
  field: FieldConfig;
  value: any;
  onChange: (name: string, value: any) => void;
  error?: string;
}

export default function FormField({ field, value, onChange, error }: FormFieldProps) {
  const baseInputClass =
    'w-full text-sm border border-neutral-200 rounded-md px-3 py-2 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500';

  return (
    <div>
      <label className="block text-xs font-medium text-neutral-600 mb-1.5">
        {field.label}
        {field.required && <span className="text-danger ml-0.5">*</span>}
      </label>

      {field.type === 'text' && (
        <input
          type="text"
          value={value ?? ''}
          placeholder={field.placeholder}
          onChange={(e) => onChange(field.name, e.target.value)}
          className={baseInputClass}
        />
      )}

      {field.type === 'number' && (
        <input
          type="number"
          value={value ?? ''}
          placeholder={field.placeholder}
          onChange={(e) => onChange(field.name, e.target.value === '' ? null : Number(e.target.value))}
          className={baseInputClass}
        />
      )}

      {field.type === 'date' && (
        <input
          type="date"
          value={value ?? ''}
          onChange={(e) => onChange(field.name, e.target.value)}
          className={baseInputClass}
        />
      )}

      {field.type === 'textarea' && (
        <textarea
          value={value ?? ''}
          placeholder={field.placeholder}
          onChange={(e) => onChange(field.name, e.target.value)}
          rows={4}
          className={baseInputClass}
        />
      )}

      {(field.type === 'select' || field.type === 'relation') && (
        <select
          value={value ?? ''}
          onChange={(e) => onChange(field.name, e.target.value)}
          className={baseInputClass}
        >
          <option value="">Select...</option>
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}

      {field.type === 'checkbox' && (
        <label className="flex items-center gap-2 mt-1">
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => onChange(field.name, e.target.checked)}
            className="w-4 h-4 rounded border-neutral-300 text-primary-600"
          />
          <span className="text-sm text-neutral-600">Enabled</span>
        </label>
      )}

      {error && <p className="text-xs text-danger mt-1">{error}</p>}
    </div>
  );
}
