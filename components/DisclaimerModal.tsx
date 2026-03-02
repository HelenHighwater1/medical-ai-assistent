"use client";

import { useState, useEffect } from "react";

const SESSION_KEY = "disclaimerAccepted";

export default function DisclaimerModal() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const accepted = typeof window !== "undefined" && sessionStorage.getItem(SESSION_KEY) === "true";
    setShow(!accepted);
  }, []);

  useEffect(() => {
    if (show) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [show]);

  const handleAccept = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(SESSION_KEY, "true");
    }
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="disclaimer-title"
      aria-describedby="disclaimer-description"
    >
      <div className="relative mx-4 w-full max-w-md rounded-2xl bg-white p-8 shadow-xl animate-slide-up">
        <h2 id="disclaimer-title" className="text-lg font-semibold text-gray-900">
          Important notice
        </h2>
        <p id="disclaimer-description" className="mt-3 leading-relaxed text-gray-600">
          This is a demo project — not a real medical tool. Do not enter real patient
          information. Not HIPAA compliant.
        </p>
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleAccept}
            className="rounded-full bg-moss-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-moss-700 focus:outline-none focus:ring-2 focus:ring-moss-500 focus:ring-offset-2"
          >
            I understand
          </button>
        </div>
      </div>
    </div>
  );
}
