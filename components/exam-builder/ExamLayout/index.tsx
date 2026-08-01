'use client';

import { ReactNode } from 'react';

interface ExamLayoutProps {
  header: ReactNode;
  sidebar: ReactNode;
  children: ReactNode;
}

export default function ExamLayout({
  header,
  sidebar,
  children,
}: ExamLayoutProps) {
  return (
    <div className="mx-auto max-w-7xl px-6 py-6">

      {header}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">

        <main>

          {children}

        </main>

        <aside>

          {sidebar}

        </aside>

      </div>

    </div>
  );
}
