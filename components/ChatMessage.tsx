"use client";

import LoadingDots from "./LoadingDots";
import type { CardSection } from "./CardMessage";

export interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
  attachment?: string;
  attachmentUrl?: string;
  isStreaming?: boolean;
  cards?: CardSection[];
  isReviewingPlaceholder?: boolean;
}

interface ChatMessageProps {
  message: Message;
  onViewEmail?: (source: { type: "url"; url: string } | { type: "blob"; blobUrl: string; filename: string }) => void;
  onViewPdf?: (url: string) => void;
}

export default function ChatMessage({ message, onViewEmail, onViewPdf }: ChatMessageProps) {
  const isUser = message.role === "user";
  const isEmailAttachment =
    message.attachment &&
    (message.attachment.toLowerCase().endsWith(".eml") || message.attachmentUrl?.toLowerCase().includes(".eml"));
  const isPdfAttachment =
    message.attachment &&
    (message.attachment.toLowerCase().endsWith(".pdf") || message.attachmentUrl?.toLowerCase().includes(".pdf"));
  const showEmailModal =
    isEmailAttachment && message.attachmentUrl && onViewEmail;
  const showPdfModal = isPdfAttachment && message.attachmentUrl && onViewPdf;

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] space-y-1">
          {message.attachment && (
            <div className="flex items-center justify-end gap-1.5">
              {message.attachmentUrl ? (
                showEmailModal ? (
                  <button
                    type="button"
                    onClick={() => {
                      const url = message.attachmentUrl!;
                      if (url.startsWith("/")) {
                        onViewEmail!({ type: "url", url });
                      } else {
                        onViewEmail!({
                          type: "blob",
                          blobUrl: url,
                          filename: message.attachment!,
                        });
                      }
                    }}
                    className="inline-flex items-center gap-1 rounded-full bg-moss-100 px-2.5 py-0.5 text-xs font-medium text-moss-700 transition-colors hover:bg-moss-200"
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
                      <path d="M7 1H3.5a1 1 0 00-1 1v8a1 1 0 001 1h5a1 1 0 001-1V3.5L7 1z" />
                      <path d="M7 1v2.5h2.5" />
                    </svg>
                    {message.attachment}
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 10 10"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="opacity-50"
                    >
                      <path d="M4 1h5v5" />
                      <path d="M9 1L3.5 6.5" />
                    </svg>
                  </button>
                ) : showPdfModal ? (
                  <button
                    type="button"
                    onClick={() => onViewPdf!(message.attachmentUrl!)}
                    className="inline-flex items-center gap-1 rounded-full bg-moss-100 px-2.5 py-0.5 text-xs font-medium text-moss-700 transition-colors hover:bg-moss-200"
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
                      <path d="M7 1H3.5a1 1 0 00-1 1v8a1 1 0 001 1h5a1 1 0 001-1V3.5L7 1z" />
                      <path d="M7 1v2.5h2.5" />
                    </svg>
                    {message.attachment}
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 10 10"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="opacity-50"
                    >
                      <path d="M4 1h5v5" />
                      <path d="M9 1L3.5 6.5" />
                    </svg>
                  </button>
                ) : (
                  <a
                    href={message.attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-full bg-moss-100 px-2.5 py-0.5 text-xs font-medium text-moss-700 transition-colors hover:bg-moss-200"
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
                      <path d="M7 1H3.5a1 1 0 00-1 1v8a1 1 0 001 1h5a1 1 0 001-1V3.5L7 1z" />
                      <path d="M7 1v2.5h2.5" />
                    </svg>
                    {message.attachment}
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 10 10"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="opacity-50"
                    >
                      <path d="M4 1h5v5" />
                      <path d="M9 1L3.5 6.5" />
                    </svg>
                  </a>
                )
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-moss-100 px-2.5 py-0.5 text-xs font-medium text-moss-700">
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
                  {message.attachment}
                </span>
              )}
            </div>
          )}
          <div className="rounded-2xl rounded-br-md border border-moss-200 bg-moss-50 px-4 py-3">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800 line-clamp-6">
              {message.content}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (message.isStreaming && !message.content && !message.cards) {
    return (
      <div className="flex justify-start">
        <div className="max-w-[85%]">
          <div className="rounded-2xl rounded-bl-md border border-warm-gray-200 bg-white px-4 py-3 shadow-sm">
            <LoadingDots />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[85%]">
        <div className="rounded-2xl rounded-bl-md border border-warm-gray-200 bg-white px-4 py-3 shadow-sm">
          <div className="space-y-2 text-sm leading-relaxed text-gray-700">
            {message.content.split("\n\n").map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
            {message.isStreaming && message.content && (
              <span className="inline-block h-3 w-1 animate-pulse rounded-full bg-moss-400" />
            )}
          </div>
          {!message.isStreaming && message.content && !message.isReviewingPlaceholder && (
            <p className="mt-3 border-t border-warm-gray-200 pt-2 text-[10px] text-warm-gray-400">
              Based on your document - always verify with your doctor
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
