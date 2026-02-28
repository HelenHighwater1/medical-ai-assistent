import { NextResponse } from "next/server";
import { htmlToPlainText } from "@/lib/html-to-plain-text";
import { simpleParser } from "mailparser";
// pdf-parse is CommonJS-only; dynamic require used for compatibility
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse/lib/pdf-parse");

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    const filename = file.name;
    let text: string;

    if (file.type === "application/pdf" || filename.endsWith(".pdf")) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const data = await pdfParse(buffer);
      text = data.text;
    } else if (filename.endsWith(".txt") || file.type.startsWith("text/")) {
      text = await file.text();
    } else if (filename.endsWith(".eml") || file.type === "message/rfc822") {
      const buffer = Buffer.from(await file.arrayBuffer());
      const parsed = await simpleParser(buffer);
      const from = parsed.from?.text ?? "";
      const toField = parsed.to;
      const to = toField
        ? (Array.isArray(toField) ? toField.map((a) => a.text).join(", ") : toField.text)
        : "";
      const subject = parsed.subject ?? "";
      const headerBlock = [from && `From: ${from}`, to && `To: ${to}`, subject && `Subject: ${subject}`]
        .filter(Boolean)
        .join("\n");
      const body =
        (parsed.text && parsed.text.trim()) || (parsed.html ? htmlToPlainText(parsed.html) : "");
      text = [headerBlock, body].filter(Boolean).join("\n\n");
    } else {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload a PDF, TXT, or EML file." },
        { status: 400 }
      );
    }

    return NextResponse.json({ text: text.trim(), filename });
  } catch (error) {
    console.error("Extract route error:", error);
    return NextResponse.json(
      { error: "Failed to extract text from file" },
      { status: 500 }
    );
  }
}
