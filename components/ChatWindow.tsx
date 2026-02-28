"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import ChatMessage, { type Message } from "./ChatMessage";
import CardMessage, { type CardSection } from "./CardMessage";
import ChatInput from "./ChatInput";
import Sidebar from "./Sidebar";
import LoadingDots from "./LoadingDots";
import EmailViewModal, { type EmailViewSource } from "./EmailViewModal";
import PdfViewModal from "./PdfViewModal";
import { SAMPLE_DOCS, type SampleDoc } from "@/lib/sample-docs";
import { detectDistress } from "@/lib/emotional-detection";
import { DISTRESS_PREAMBLE } from "@/lib/prompt";

interface PendingCards {
  cards: CardSection[];
  revealedCount: number;
}

function nextMessageId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [pendingCards, setPendingCards] = useState<PendingCards | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailModalSource, setEmailModalSource] = useState<EmailViewSource | null>(null);
  const [pdfModalUrl, setPdfModalUrl] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatAreaRef = useRef<HTMLDivElement>(null);
  const blobUrlsRef = useRef<Set<string>>(new Set());

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      if (chatAreaRef.current) {
        chatAreaRef.current.scrollTo({
          top: chatAreaRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
    }, 50);
  }, []);

  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    const shouldScroll =
      messages.length === 0 ||
      lastMsg?.role === "assistant" ||
      (pendingCards != null && pendingCards.revealedCount > 0) ||
      showSummary;
    if (shouldScroll) scrollToBottom();
  }, [messages, pendingCards?.revealedCount, showSummary, scrollToBottom]);

  // Revoke blob URLs when messages no longer reference them
  useEffect(() => {
    const currentUrls = new Set(
      messages
        .map((m) => m.attachmentUrl)
        .filter((url): url is string => typeof url === "string" && url.startsWith("blob:"))
    );
    blobUrlsRef.current.forEach((url) => {
      if (!currentUrls.has(url)) {
        URL.revokeObjectURL(url);
        blobUrlsRef.current.delete(url);
      }
    });
  }, [messages]);

  // On unmount, revoke any remaining blob URLs
  useEffect(() => {
    return () => {
      blobUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      blobUrlsRef.current.clear();
    };
  }, []);

  async function extractFileText(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch("/api/extract", {
      method: "POST",
      body: formData,
    });
    if (!response.ok) throw new Error("Failed to extract text from file");
    const data = await response.json();
    return data.text;
  }

  function isFollowUp(): boolean {
    return messages.some((m) => m.cards && m.cards.length > 0);
  }

  function getCardsFromMessages(): CardSection[] {
    const allCards: CardSection[] = [];
    for (const m of messages) {
      if (m.cards && m.cards.length > 0) allCards.push(...m.cards);
    }
    return allCards;
  }

  function getUserQuestions(): string[] {
    return messages
      .filter((m) => m.role === "user" && !m.attachment)
      .map((m) => m.content)
      .filter((c) => c.length < 500);
  }

  async function fetchCards(apiMessages: { role: string; content: string }[]): Promise<CardSection[]> {
    const response = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: apiMessages, mode: "cards" }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = data.details || data.error || "Failed to get response";
      throw new Error(message);
    }
    if (data.type === "validation_failed") {
      throw new Error(data.error || "Summary may not match the document. Please try again.");
    }
    if (data.type === "cards" && Array.isArray(data.cards)) {
      return data.cards;
    }
    throw new Error("Unexpected response format");
  }

  async function streamFollowUp(newMessages: Message[], userText: string) {
    const isDistressed = detectDistress(userText);

    const apiMessages = newMessages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const response = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: apiMessages,
        mode: "stream",
        ...(isDistressed && { systemPromptSuffix: DISTRESS_PREAMBLE }),
      }),
    });

    if (!response.ok) throw new Error("Failed to get response");

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No response stream");

    const decoder = new TextDecoder();
    let accumulated = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      accumulated += decoder.decode(value, { stream: true });
    }

    setMessages([
      ...newMessages,
      { id: nextMessageId(), role: "assistant", content: accumulated },
    ]);
  }

  async function sendMessage(text: string, file?: File) {
    let content = text;
    let attachment: string | undefined;
    let attachmentUrl: string | undefined;

    if (file) {
      attachment = file.name;
      attachmentUrl = URL.createObjectURL(file);
      blobUrlsRef.current.add(attachmentUrl);
      try {
        const extractedText = await extractFileText(file);
        content = content
          ? `${content}\n\n[Attached file: ${file.name}]\n${extractedText}`
          : extractedText;
      } catch {
        content = content || `[Unable to read file: ${file.name}]`;
      }
    }

    if (!content.trim()) return;

    const userMessage: Message = { id: nextMessageId(), role: "user", content, attachment, attachmentUrl };
    const newMessages = [...messages, userMessage];

    const shouldStream = isFollowUp() && !file;

    if (shouldStream) {
      setMessages([...newMessages, { id: nextMessageId(), role: "assistant", content: "", isStreaming: true }]);
      setIsStreaming(true);
      try {
        await streamFollowUp(newMessages, text);
      } catch {
        setMessages([
          ...newMessages,
          { id: nextMessageId(), role: "assistant", content: "Sorry, something went wrong. Please try again." },
        ]);
      } finally {
        setIsStreaming(false);
      }
    } else {
      await runCardsFlow(newMessages);
    }
  }

  async function runCardsFlow(newMessages: Message[]) {
    const reviewingPlaceholder: Message = {
      id: nextMessageId(),
      role: "assistant",
      content: "Let me just review this document - it will only take a minute.",
      isReviewingPlaceholder: true,
    };
    setMessages([...newMessages, reviewingPlaceholder]);
    setIsLoading(true);
    setPendingCards(null);
    setShowSummary(false);

    try {
      const apiMessages = newMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));
      const cards = await fetchCards(apiMessages);
      const firstCardMessage: Message = {
        id: nextMessageId(),
        role: "assistant",
        content: cards[0].body,
        cards: [cards[0]],
      };
      setMessages((prev) => [
        ...prev.filter((m) => !m.isReviewingPlaceholder),
        firstCardMessage,
      ]);
      if (cards.length <= 1) {
        setPendingCards(null);
      } else {
        setPendingCards({ cards, revealedCount: 1 });
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev.filter((m) => !m.isReviewingPlaceholder),
        {
          id: nextMessageId(),
          role: "assistant",
          content: err instanceof Error ? err.message : "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleContinue() {
    if (!pendingCards) return;
    const nextIndex = pendingCards.revealedCount;
    if (nextIndex >= pendingCards.cards.length) {
      setPendingCards(null);
      return;
    }
    const nextCard = pendingCards.cards[nextIndex];
    setMessages((prev) => [
      ...prev,
      { id: nextMessageId(), role: "assistant" as const, content: nextCard.body, cards: [nextCard] },
    ]);
    const newCount = nextIndex + 1;
    if (newCount >= pendingCards.cards.length) {
      setPendingCards(null);
    } else {
      setPendingCards({ ...pendingCards, revealedCount: newCount });
    }
  }

  const allCardsRevealed = pendingCards
    ? pendingCards.revealedCount >= pendingCards.cards.length
    : true;

  const hasCompletedCards = !pendingCards && messages.some((m) => m.cards && m.cards.length > 0);

  async function handleSampleFromSidebar(doc: SampleDoc) {
    if (isLoading || isStreaming) return;

    const attachmentLabel = doc.type === "pdf" ? doc.title + ".pdf" : doc.title;
    const attachmentUrl = doc.fileUrl || undefined;
    let content = doc.content;

    if (doc.fileUrl && (doc.type === "pdf" || doc.type === "email")) {
      const loadingUserMsg: Message = {
        id: nextMessageId(),
        role: "user",
        content: "Loading document...",
        attachment: attachmentLabel,
        attachmentUrl,
      };
      setMessages((prev) => [...prev, loadingUserMsg]);
      setIsLoading(true);

      try {
        const fileResponse = await fetch(doc.fileUrl);
        const blob = await fileResponse.blob();
        const file = new File(
          [blob],
          doc.type === "pdf" ? attachmentLabel : doc.title + ".eml",
          { type: doc.type === "pdf" ? "application/pdf" : "message/rfc822" }
        );
        content = await extractFileText(file);
      } catch {
        content = `[Sample document: ${doc.title}]`;
      }
    }

    const userMessage: Message = {
      id: nextMessageId(),
      role: "user",
      content,
      attachment: attachmentLabel,
      attachmentUrl,
    };
    const newMessages = [...messages, userMessage];
    await runCardsFlow(newMessages);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const sampleId = e.dataTransfer.getData("application/sample-doc-id");
    if (sampleId) {
      const doc = SAMPLE_DOCS.find((d) => d.id === sampleId);
      if (doc) handleSampleFromSidebar(doc);
      return;
    }
    const file = e.dataTransfer.files[0];
    if (
      file &&
      (file.type === "application/pdf" ||
        file.name.endsWith(".txt") ||
        file.name.endsWith(".eml") ||
        file.type === "message/rfc822")
    ) {
      sendMessage("", file);
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }

  function generateSummary() {
    const cards = getCardsFromMessages();
    const userQuestions = getUserQuestions();

    const questionsCard = cards.find((c) => c.type === "questions");
    const suggestedQuestions = questionsCard
      ? (questionsCard.body ?? "").split("\n").filter((l) => l.trim()).map((q) => q.replace(/^[-•\d.)\s]+/, ""))
      : [];

    const mainFinding = cards.find((c) => c.label === "The main finding");
    const nextSteps = cards.find((c) => c.label === "What happens next");

    return { mainFinding, nextSteps, suggestedQuestions, userQuestions };
  }

  const isEmpty = messages.length === 0;
  const inputDisabled = isLoading || isStreaming;

  function openEmailViewer(source: EmailViewSource) {
    setEmailModalSource(source);
    setEmailModalOpen(true);
  }

  function openPdfViewer(url: string) {
    setPdfModalUrl(url);
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 gap-6 px-6 pb-6">
      <Sidebar onSelectSample={handleSampleFromSidebar} onViewEmail={openEmailViewer} onViewPdf={openPdfViewer} />

      <div
        className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-warm-gray-200 bg-chat-bg shadow-sm"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div
          ref={chatAreaRef}
          className="flex-1 overflow-y-auto p-4"
          style={{ minHeight: "400px", maxHeight: "calc(100vh - 380px)" }}
        >
          {isEmpty && !isLoading ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-moss-50">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-moss-400"
                  >
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-warm-gray-600">
                  Upload a document or pick a sample to start
                  <br />
                  preparing for your next appointment.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, i) => {
                const msgKey = msg.id ?? i;
                if (msg.cards && msg.cards.length > 0) {
                  return (
                    <div key={msgKey} className="space-y-3">
                      {msg.cards.map((card, ci) => (
                        <CardMessage key={`${msgKey}-${ci}`} card={card} />
                      ))}
                    </div>
                  );
                }

                return <ChatMessage key={msgKey} message={msg} onViewEmail={openEmailViewer} onViewPdf={openPdfViewer} />;
              })}

              {isLoading && !pendingCards && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-md border border-warm-gray-200 bg-white px-4 py-3 shadow-sm">
                    <LoadingDots />
                  </div>
                </div>
              )}

              {pendingCards && !allCardsRevealed && (
                <div className="flex justify-center py-2">
                  <button
                    onClick={handleContinue}
                    disabled={isStreaming}
                    className="rounded-full border border-moss-200 bg-white px-5 py-2 text-sm font-medium text-moss-600 shadow-sm transition-all hover:bg-moss-50 hover:shadow-md active:scale-[0.97] disabled:opacity-40 disabled:hover:bg-white disabled:hover:shadow-sm"
                  >
                    Continue
                  </button>
                </div>
              )}

              {hasCompletedCards && !showSummary && (
                <div className="flex justify-center py-3">
                  <button
                    onClick={() => setShowSummary(true)}
                    className="inline-flex items-center gap-2 rounded-full border border-moss-200 bg-white px-5 py-2.5 text-sm font-medium text-moss-600 shadow-sm transition-all hover:bg-moss-50 hover:shadow-md active:scale-[0.97]"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="1" width="10" height="14" rx="1.5" />
                      <path d="M6 5h4M6 8h4M6 11h2" />
                    </svg>
                    Prepare for your appointment
                  </button>
                </div>
              )}

              {showSummary && <AppointmentSummary {...generateSummary()} />}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <ChatInput
          onSend={sendMessage}
          disabled={inputDisabled}
          placeholder={pendingCards && !allCardsRevealed ? "Ask a question, or press Continue above\u2026" : undefined}
        />
      </div>
      <EmailViewModal
        isOpen={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        source={emailModalSource}
      />
      <PdfViewModal
        isOpen={pdfModalUrl != null}
        onClose={() => setPdfModalUrl(null)}
        url={pdfModalUrl}
      />
    </div>
  );
}

function AppointmentSummary({
  mainFinding,
  nextSteps,
  suggestedQuestions,
  userQuestions,
}: {
  mainFinding?: CardSection;
  nextSteps?: CardSection;
  suggestedQuestions: string[];
  userQuestions: string[];
}) {
  const summaryRef = useRef<HTMLDivElement>(null);

  async function handleSavePdf() {
    if (!summaryRef.current) return;
    const html2canvas = (await import("html2canvas-pro")).default;
    const jsPDF = (await import("jspdf")).default;

    const canvas = await html2canvas(summaryRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: [canvas.width, canvas.height],
    });
    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save("appointment-summary.pdf");
  }

  return (
    <div className="animate-slide-up">
      <div ref={summaryRef} className="mx-auto max-w-[85%] rounded-2xl border-2 border-moss-200 bg-gradient-to-b from-moss-50/60 to-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-moss-600">
            <rect x="3" y="1" width="12" height="16" rx="2" />
            <path d="M6.5 5.5h5M6.5 8.5h5M6.5 11.5h3" />
          </svg>
          <h3 className="text-sm font-bold text-moss-900">
            What to bring to your appointment
          </h3>
        </div>

        {mainFinding && (
          <div className="mb-3">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-warm-gray-400">
              Key finding to discuss
            </p>
            <p className="text-sm leading-relaxed text-gray-700">
              {mainFinding.body}
            </p>
          </div>
        )}

        {nextSteps && (
          <div className="mb-3">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-warm-gray-400">
              Next steps mentioned
            </p>
            <p className="text-sm leading-relaxed text-gray-700">
              {nextSteps.body}
            </p>
          </div>
        )}

        {suggestedQuestions.length > 0 && (
          <div className="mb-3">
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-warm-gray-400">
              Questions to ask
            </p>
            <ul className="space-y-1">
              {suggestedQuestions.map((q, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-moss-100 text-[9px] font-bold text-moss-600">
                    {i + 1}
                  </span>
                  {q}
                </li>
              ))}
            </ul>
          </div>
        )}

        {userQuestions.length > 0 && (
          <div className="mb-3">
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-warm-gray-400">
              Your questions from this conversation
            </p>
            <ul className="space-y-1">
              {userQuestions.map((q, i) => (
                <li key={i} className="text-sm text-gray-700">
                  &ldquo;{q}&rdquo;
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-4 border-t border-moss-100 pt-3 flex justify-center">
          <button
            onClick={handleSavePdf}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-moss-600 transition-colors hover:bg-moss-50"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 1v8M3.5 5.5L7 9l3.5-3.5" />
              <path d="M1.5 10v1.5a1 1 0 001 1h9a1 1 0 001-1V10" />
            </svg>
            Save as PDF
          </button>
        </div>
      </div>
    </div>
  );
}
