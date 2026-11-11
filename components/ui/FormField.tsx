import clsx from "clsx";
import { useId } from "react";

// Label, control, hint and error in one place, with the ids wired for screen readers.
export default function FormField({ label, hint, error, required, className, children }: {
  label: string; hint?: string; error?: string; required?: boolean; className?: string;
  children: (props: { id: string; "aria-describedby"?: string; "aria-invalid"?: boolean }) => React.ReactNode;
}) {
  const id = useId();
  const described = error ? id + "-error" : hint ? id + "-hint" : undefined;
  return (
    <div className={clsx("block", className)}>
      <label htmlFor={id} className="mb-1 block text-xs font-medium text-neutral-600">{label}{required && <span className="text-danger"> *</span>}</label>
      {children({ id, "aria-describedby": described, "aria-invalid": error ? true : undefined })}
      {error ? <p id={id + "-error"} role="alert" className="mt-1 text-xs text-danger">{error}</p> : hint ? <p id={id + "-hint"} className="mt-1 text-2xs text-neutral-500">{hint}</p> : null}
    </div>
  );
}
