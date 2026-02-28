"use client";

import type { SampleDoc } from "@/lib/sample-docs";
import type { EmailViewSource } from "./EmailViewModal";

interface SampleCardProps {
  doc: SampleDoc;
  onSelect: (doc: SampleDoc) => void;
  onViewEmail?: (source: EmailViewSource) => void;
  onViewPdf?: (url: string) => void;
}

export default function SampleCard({ doc, onSelect, onViewEmail, onViewPdf }: SampleCardProps) {
  function handleDragStart(e: React.DragEvent) {
    e.dataTransfer.setData("application/sample-doc-id", doc.id);
    e.dataTransfer.effectAllowed = "copy";
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="rounded-xl border border-warm-gray-200 bg-surface transition-all hover:border-moss-200 hover:shadow-sm cursor-grab active:cursor-grabbing"
    >
      <button
        onClick={() => onSelect(doc)}
        className="flex w-full items-start gap-3 p-4 text-left active:scale-[0.98]"
        aria-label={`Use mock example: ${doc.title}`}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-moss-50 text-moss-600">
          {doc.type === "pdf" ? (
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10.5 1.5H4.5a1.5 1.5 0 00-1.5 1.5v12a1.5 1.5 0 001.5 1.5h9a1.5 1.5 0 001.5-1.5V6l-4.5-4.5z" />
              <path d="M10.5 1.5V6H15" />
              <path d="M6 9.75h6M6 12.75h4" />
            </svg>
          ) : (
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="1.5" y="3" width="15" height="12" rx="1.5" />
              <path d="M1.5 6l7.5 4.5L16.5 6" />
            </svg>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900">{doc.title}</p>
          <p className="mt-0.5 text-xs text-gray-500">{doc.description}</p>
        </div>
      </button>
      {doc.fileUrl && (
        <div className="border-t border-warm-gray-200 px-4 py-2">
          {doc.type === "email" && onViewEmail ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onViewEmail({ type: "url", url: doc.fileUrl });
              }}
              className="inline-flex items-center gap-1 text-xs text-moss-500 transition-colors hover:text-moss-700"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 1h7v7" />
                <path d="M11 1L5 7" />
              </svg>
              View original file
            </button>
          ) : doc.type === "pdf" && onViewPdf ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onViewPdf(doc.fileUrl);
              }}
              className="inline-flex items-center gap-1 text-xs text-moss-500 transition-colors hover:text-moss-700"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 1h7v7" />
                <path d="M11 1L5 7" />
              </svg>
              View original file
            </button>
          ) : (
            <a
              href={doc.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-xs text-moss-500 transition-colors hover:text-moss-700"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 1h7v7" />
                <path d="M11 1L5 7" />
              </svg>
              View original file
            </a>
          )}
        </div>
      )}
    </div>
  );
}
