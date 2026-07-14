'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import FormField, { FieldConfig } from './FormField';

interface RecordFormProps {
  title: string;
  fields: FieldConfig[];
  initialValues?: Record<string, any>;
  onSubmit: (values: Record<string, any>) => Promise<unknown>;
  backHref: string;
}

export default function RecordForm({ title, fields, initialValues = {}, onSubmit, backHref }: RecordFormProps) {
  const [values, setValues] = useState<Record<string, any>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const handleChange = (name: string, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    fields.forEach((f) => {
      if (f.required && (values[f.name] === undefined || values[f.name] === '')) {
        newErrors[f.name] = `${f.label} is required`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await onSubmit(values);
      router.push(backHref);
    } catch (err) {
      console.error('Save failed', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card padding="lg">
      <h2 className="text-lg font-bold text-neutral-900 mb-6">{title}</h2>
      <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-5">
        {fields.map((field) => (
          <div key={field.name} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
            <FormField field={field} value={values[field.name]} onChange={handleChange} error={errors[field.name]} />
          </div>
        ))}
        <div className="md:col-span-2 flex gap-3 pt-4 border-t border-neutral-100 mt-2">
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.push(backHref)}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}
