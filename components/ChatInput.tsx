"use client";

import { useRef, useCallback, useState } from "react";

interface ChatInputProps {
  onSend: (text: string, file?: File) => void;
  disabled: boolean;
  placeholder?: string;
}

export default function ChatInput({ onSend, disabled, placeholder }: ChatInputProps) {
  const [text, setText] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, []);

  function handleSubmit() {
    const trimmed = text.trim();
    if (!trimmed && !pendingFile) return;
    onSend(trimmed, pendingFile || undefined);
    setText("");
    setPendingFile(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setPendingFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const sampleId = e.dataTransfer.getData("application/sample-doc-id");
    if (sampleId) return;

    const file = e.dataTransfer.files[0];
    if (
      file &&
      (file.type === "application/pdf" ||
        file.name.endsWith(".txt") ||
        file.name.endsWith(".eml") ||
        file.type === "message/rfc822")
    ) {
      setPendingFile(file);
    }
  }

  const hasContent = text.trim() || pendingFile;

  return (
    <div className="border-t border-warm-gray-200 bg-surface p-3">
      {pendingFile && (
        <div className="mb-2 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-moss-100 px-3 py-1 text-xs font-medium text-moss-700">
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
              <path d="M7 1H3.5a1 1 0 00-1 1v8a1 1 0 001 1h5a1 1 0 001-1V3.5L7 1z" />
              <path d="M7 1v2.5h2.5" />
            </svg>
            {pendingFile.name}
            <button
              onClick={() => setPendingFile(null)}
              className="ml-1 rounded-full p-0.5 hover:bg-moss-200"
              aria-label="Remove file"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <line x1="2" y1="2" x2="8" y2="8" />
                <line x1="8" y1="2" x2="2" y2="8" />
              </svg>
            </button>
          </span>
        </div>
      )}

      <div
        className={`flex items-center gap-2 rounded-xl border bg-surface p-2 transition-colors ${
          isDragOver
            ? "border-moss-400 ring-2 ring-moss-100"
            : "border-warm-gray-200"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
          aria-label="Attach file"
        >
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
            <path d="M15.75 8.625l-6.879 6.879a3.75 3.75 0 01-5.303-5.303l6.879-6.879a2.5 2.5 0 013.535 3.536l-6.886 6.878a1.25 1.25 0 01-1.768-1.768l6.376-6.375" />
          </svg>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt,.eml"
          onChange={handleFileSelect}
          className="hidden"
        />
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            adjustHeight();
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder ?? "Type a message or drop a file\u2026"}
          disabled={disabled}
          rows={1}
          className="max-h-[120px] min-h-[36px] flex-1 resize-none bg-transparent text-sm leading-relaxed text-gray-800 placeholder:text-gray-400 outline-none disabled:opacity-50"
          aria-label="Chat message input"
        />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={disabled || !hasContent}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-moss-600 text-white transition-all hover:bg-moss-700 disabled:opacity-40 disabled:hover:bg-moss-600"
          aria-label="Send message"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2L7 9" />
            <path d="M14 2l-4.5 12-2.5-5.5L2 6z" />
          </svg>
        </button>
      </div>

      <p className="mt-2 text-center text-[11px] leading-relaxed text-warm-gray-400">
        This AI summarizes your document to help you prepare questions. It can
        make mistakes. Your care team is always your most important resource.
      </p>
    </div>
  );
}
