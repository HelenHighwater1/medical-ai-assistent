"use client";

import { SAMPLE_DOCS, type SampleDoc } from "@/lib/sample-docs";
import SampleCard from "./SampleCard";
import type { EmailViewSource } from "./EmailViewModal";

interface SidebarProps {
  onSelectSample: (doc: SampleDoc) => void;
  onViewEmail?: (source: EmailViewSource) => void;
  onViewPdf?: (url: string) => void;
}

export default function Sidebar({ onSelectSample, onViewEmail, onViewPdf }: SidebarProps) {
  return (
    <aside className="flex w-full shrink-0 flex-col gap-3 lg:w-[280px]">
      <p className="text-sm font-medium text-moss-800">Mock data examples:</p>
      {SAMPLE_DOCS.map((doc) => (
        <SampleCard key={doc.id} doc={doc} onSelect={onSelectSample} onViewEmail={onViewEmail} onViewPdf={onViewPdf} />
      ))}
    </aside>
  );
}
