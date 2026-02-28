"use client";

import { useEffect, useRef, useCallback } from "react";

interface AboutMeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutMeModal({ isOpen, onClose }: AboutMeModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

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
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
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
      className="fixed inset-0 z-50 flex cursor-pointer items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="About Helen"
    >
      <div
        ref={modalRef}
        className="relative mx-4 flex w-full max-w-md max-h-[90vh] flex-col rounded-2xl bg-white shadow-xl animate-slide-up overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={closeButtonRef}
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          aria-label="Close dialog"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <line x1="5" y1="5" x2="15" y2="15" />
            <line x1="15" y1="5" x2="5" y2="15" />
          </svg>
        </button>

        <div className="overflow-y-auto max-h-[calc(90vh-5rem)] p-8 pr-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Hi, I&apos;m Helen!
        </h2>

        <section className="mt-6" aria-labelledby="me-specifically-heading">
          <h3
            id="me-specifically-heading"
            className="text-sm font-semibold uppercase tracking-wide text-moss-600"
          >
            Me Specifically:
          </h3>
          <p className="mt-2 leading-relaxed text-gray-600">
            Take a look at my portfolio site - you can learn more about me, and
            see amazing pictures of my pup!
          </p>
          <div className="mt-3">
            <a
              href="https://heyimhelen.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-moss-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-moss-700"
            >
              Visit my website
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 1h7v7" />
                <path d="M13 1L1 13" />
              </svg>
            </a>
          </div>
        </section>

        <section
          className="mt-8 pt-6 border-t border-gray-200"
          aria-labelledby="why-project-heading"
        >
          <h3
            id="why-project-heading"
            className="text-sm font-semibold uppercase tracking-wide text-moss-600"
          >
            Why I did this project
          </h3>
          <div className="mt-3 space-y-3 leading-relaxed text-gray-600">
            <p>
              I am passionate about Citizen Health&apos;s mission - and that
              passion is personal.
            </p>
            <p>
              My mom had ALS. I remember seeing the PDFs and information she was
              given. The documents were overwhelming, not just because of the
              technical details and acronyms, and stuff like that, but also
              because each page had an emotional weight. We were just trying to
              understand what was happening to someone we loved.
            </p>
            <p>
              This app is to suppliment an application to join your SWE team. It
              takes a clinical document and translates it into something a
              frightened person can actually absorb - one piece at a time, in
              plain language, with warmth. It ends with a list of specific
              questions to bring to the next appointment, because that&apos;s
              what we always needed and never had.
            </p>
            <p>
              I am applying to Citizen Health specifically because I want to
              spend my career building technology that matters to people in the
              hardest moments of their lives. This is just a toy demo - Citizen
              Health is the real deal, and I want to be part of it.
            </p>
          </div>
        </section>
        </div>
      </div>
    </div>
  );
}
