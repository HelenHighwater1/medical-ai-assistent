import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT, FOLLOW_UP_SYSTEM_PROMPT } from "@/lib/prompt";
import { NextResponse } from "next/server";

const anthropic = new Anthropic();

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/** Extract a list of key terms (longer words) from the input for validation. */
function extractKeyTerms(input: string, maxTerms = 20): string[] {
  const words = input
    .replace(/[\r\n]+/g, " ")
    .split(/\s+/)
    .map((w) => w.replace(/^[^\w]+|[^\w]+$/g, ""))
    .filter((w) => w.length >= 5 && /[a-zA-Z]/.test(w));
  const seen = new Set<string>();
  const terms: string[] = [];
  for (const w of words) {
    const lower = w.toLowerCase();
    if (!seen.has(lower)) {
      seen.add(lower);
      terms.push(lower);
      if (terms.length >= maxTerms) break;
    }
  }
  return terms;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const mode: string = body.mode || "cards";

    let messages: ChatMessage[];

    if (body.messages && Array.isArray(body.messages)) {
      messages = body.messages;
    } else if (body.text && typeof body.text === "string") {
      messages = [{ role: "user", content: body.text }];
    } else {
      return new Response("Missing messages or text field", { status: 400 });
    }

    if (messages.length === 0) {
      return new Response("No messages provided", { status: 400 });
    }

    if (mode === "cards") {
      const lastUserContent =
        messages.filter((m) => m.role === "user").pop()?.content ?? "";

      const apiMessages = messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

      const response = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: apiMessages,
      });

      const text =
        response.content[0].type === "text" ? response.content[0].text : "";

      try {
        const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
        const parsed = JSON.parse(cleaned);

        const toStr = (v: unknown): string =>
          typeof v === "string" ? v : Array.isArray(v) ? v.join("\n") : v ? String(v) : "";

        const cards = [
          { label: "What this document is", body: toStr(parsed.what_this_is), type: "text" as const },
          { label: "The main finding", body: toStr(parsed.main_finding), type: "text" as const },
          { label: "What the tests showed", body: toStr(parsed.what_tests_showed), type: "text" as const },
          { label: "What happens next", body: toStr(parsed.what_happens_next), type: "text" as const },
          {
            label: "Questions to bring to your appointment",
            body: toStr(parsed.questions_to_ask || parsed.questions),
            type: "questions" as const,
          },
        ];

        const keyTerms = extractKeyTerms(lastUserContent);
        if (keyTerms.length > 0) {
          const responseText = cards.map((c) => c.body).join(" ").toLowerCase();
          const hasMatch = keyTerms.some((term) => responseText.includes(term));
          if (!hasMatch) {
            console.warn(
              "[translate/cards] Validation failed: API response does not contain any of the key terms from the input. Terms checked:",
              keyTerms.slice(0, 15)
            );
            return NextResponse.json({
              type: "validation_failed",
              error: "Summary may not match the document. Please try again.",
            });
          }
        }

        return NextResponse.json({ type: "cards", cards });
      } catch {
        return NextResponse.json({
          type: "cards",
          cards: [{ label: "Summary", body: text, type: "text" as const }],
        });
      }
    }

    const encoder = new TextEncoder();
    const systemPromptSuffix: string | undefined = body.systemPromptSuffix;
    const streamSystem =
      typeof systemPromptSuffix === "string" && systemPromptSuffix.trim()
        ? FOLLOW_UP_SYSTEM_PROMPT + "\n\n" + systemPromptSuffix.trim()
        : FOLLOW_UP_SYSTEM_PROMPT;
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          const stream = await anthropic.messages.create({
            model: "claude-sonnet-4-20250514",
            max_tokens: 2048,
            stream: true,
            system: streamSystem,
            messages: messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          });

          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }

          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const status = err && typeof err === "object" && "status" in err
      ? (err as { status: number }).status
      : undefined;
    console.error("[translate] Error:", err);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: message,
        ...(status !== undefined && { apiStatus: status }),
      },
      { status: 500 }
    );
  }
}
