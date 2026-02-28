"use client";

export interface CardSection {
  label: string;
  body: string;
  type: "text" | "questions";
}

interface CardMessageProps {
  card: CardSection;
}

export default function CardMessage({ card }: CardMessageProps) {
  const isQuestions = card.type === "questions";

  return (
    <div className="flex justify-start animate-slide-up">
      <div className="max-w-[85%]">
        <div
          className={`rounded-2xl rounded-bl-md px-4 py-3 shadow-sm ${
            isQuestions
              ? "border border-moss-100 bg-moss-50/40"
              : "border border-warm-gray-200 bg-white"
          }`}
        >
          <p
            className={`mb-2 text-[11px] font-semibold uppercase tracking-wider ${
              isQuestions ? "text-moss-500" : "text-warm-gray-400"
            }`}
          >
            {card.label}
          </p>
          {isQuestions ? (
            <div className="space-y-2">
              {card.body
                .split("\n")
                .filter((line) => line.trim())
                .map((question, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-moss-100 text-[10px] font-bold text-moss-600">
                      {i + 1}
                    </span>
                    <p className="text-sm leading-relaxed text-gray-700">
                      {question.replace(/^[-•\d.)\s]+/, "")}
                    </p>
                  </div>
                ))}
            </div>
          ) : (
            <div className="space-y-2 text-sm leading-relaxed text-gray-700">
              {(card.body ?? "").split("\n\n").map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          )}
          <p className="mt-3 border-t border-warm-gray-200 pt-2 text-[10px] text-warm-gray-400">
            Based on your document - always verify with your doctor
          </p>
        </div>
      </div>
    </div>
  );
}
