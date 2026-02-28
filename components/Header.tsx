"use client";

import { useState } from "react";
import AboutMeModal from "./AboutMeModal";

export default function Header() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-warm-gray-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-moss-900">
              A demo by Helen Highwater
            </span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/HelenHighwater1/chart-to-chair?tab=readme-ov-file#prepare-for-your-next-appointment"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-moss-200 px-4 py-1.5 text-sm font-medium text-moss-600 transition-colors hover:bg-moss-50"
            >
              Project's README
            </a>
            <button
              onClick={() => setIsModalOpen(true)}
              className="rounded-full border border-moss-200 px-4 py-1.5 text-sm font-medium text-moss-600 transition-colors hover:bg-moss-50"
            >
              About Me
            </button>
          </div>
        </div>
      </header>
      <AboutMeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
