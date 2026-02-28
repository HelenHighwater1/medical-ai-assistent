"use client";

import { useEffect, useRef, useCallback, useState } from "react";

export type EmailViewSource =
  | { type: "url"; url: string }
  | { type: "blob"; blobUrl: string; filename: string };

interface EmailViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  source: EmailViewSource | null;
}

export default function EmailViewModal({ isOpen, onClose, source }: EmailViewModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadContent = useCallback(async (src: EmailViewSource) => {
    setLoading(true);
    setError(null);
    try {
      if (src.type === "url") {
        const res = await fetch(`/api/parse-email?url=${encodeURIComponent(src.url)}`);
        if (!res.ok) throw new Error("Failed to load email");
        const data = await res.json();
        setContent(data.text ?? "");
      } else {
        const res = await fetch(src.blobUrl);
        const blob = await res.blob();
        const file = new File([blob], src.filename, { type: "message/rfc822" });
        const formData = new FormData();
        formData.append("file", file);
        const extractRes = await fetch("/api/extract", { method: "POST", body: formData });
        if (!extractRes.ok) throw new Error("Failed to load email");
        const data = await extractRes.json();
        setContent(data.text ?? "");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load email");
      setContent(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && source) {
      setContent(null);
      loadContent(source);
    }
  }, [isOpen, source, loadContent]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll(
          'button, a[href], input, textarea, select, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0] as HTMLElement;
        const last = focusable[focusable.length - 1] as HTMLElement;
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      closeButtonRef.current?.focus();
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex cursor-pointer items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="View email"
    >
      <div
        ref={modalRef}
        className="relative mx-4 flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-warm-gray-200 px-5 py-3">
          <h2 className="text-sm font-semibold text-gray-900">Email</h2>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="5" y1="5" x2="15" y2="15" />
              <line x1="15" y1="5" x2="5" y2="15" />
            </svg>
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-auto px-5 py-4">
          {loading && (
            <div className="flex items-center justify-center py-12 text-sm text-warm-gray-500">
              Loading…
            </div>
          )}
          {error && (
            <p className="py-4 text-sm text-red-600">{error}</p>
          )}
          {!loading && !error && content !== null && (
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-800">
              {content}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
