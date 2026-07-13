"use client";

import { useAdminRecord } from "@/features/admin/hooks";
import RecordForm from "@/components/admin/RecordForm";
import { FieldConfig } from "@/components/admin/FormField";

const fields: FieldConfig[] = [
  {
    name: "name",
    label: "Organization Name",
    type: "text",
    required: true,
    placeholder: "e.g. Union Public Service Commission",
  },
  {
    name: "shortName",
    label: "Short Name",
    type: "text",
    required: true,
    placeholder: "e.g. UPSC",
  },
  { name: "logoUrl", label: "Logo URL", type: "text" },
  { name: "website", label: "Website", type: "text" },
  {
    name: "type",
    label: "Organization Type",
    type: "select",
    required: true,
    options: [
      { label: "Central Govt", value: "CENTRAL_GOVT" },
      { label: "State Govt", value: "STATE_GOVT" },
      { label: "Banking", value: "BANKING" },
      { label: "Railway", value: "RAILWAY" },
      { label: "Defence / Police", value: "DEFENCE_POLICE" },
      { label: "Teaching", value: "TEACHING" },
      { label: "PSU", value: "PSU" },
      { label: "Engineering", value: "ENGINEERING" },
      { label: "Other", value: "OTHER" },
    ],
  },
];

export default function NewOrganizationPage() {
  const { save } = useAdminRecord("organizations");

  return (
    <div className="p-6 max-w-2xl">
      <RecordForm
        title="Add New Organization"
        fields={fields}
        onSubmit={(v) => save(v)}
        backHref="/admin/organizations"
      />
    </div>
  );
}
