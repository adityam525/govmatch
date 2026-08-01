'use client';

import { UploadCloud } from 'lucide-react';

interface Props {

  onFile(
    file: File,
  ): void;

}

export default function UploadZone({
  onFile,
}: Props) {

  return (

    <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary-300 p-16 text-center">

      <UploadCloud
        size={50}
      />

      <h3 className="mt-4 text-xl font-semibold">

        Upload Questions

      </h3>

      <p className="mt-2 text-neutral-500">

        CSV, Excel or JSON

      </p>

      <input

        hidden

        type="file"

        accept=".csv,.xlsx,.json"

        onChange={(e) => {

          const file =
            e.target.files?.[0];

          if (file) {

            onFile(file);

          }

        }}

      />

    </label>

  );

}
