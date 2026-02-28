import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { htmlToPlainText } from "@/lib/html-to-plain-text";
import { simpleParser } from "mailparser";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const urlParam = searchParams.get("url");
    if (!urlParam || !urlParam.startsWith("/") || urlParam.includes("..")) {
      return NextResponse.json({ error: "Invalid or missing url parameter" }, { status: 400 });
    }
    const publicDir = path.join(process.cwd(), "public");
    const filePath = path.resolve(publicDir, urlParam.slice(1));
    if (!filePath.startsWith(publicDir)) {
      return NextResponse.json({ error: "Invalid url parameter" }, { status: 400 });
    }
    const buffer = await readFile(filePath);
    const parsed = await simpleParser(buffer);
    const from = parsed.from?.text ?? "";
    const toField = parsed.to;
    const to = toField
      ? (Array.isArray(toField) ? toField.map((a) => a.text).join(", ") : toField.text)
      : "";
    const subject = parsed.subject ?? "";
    const body =
      (parsed.text && parsed.text.trim()) || (parsed.html ? htmlToPlainText(parsed.html) : "");
    const text = [from && `From: ${from}`, to && `To: ${to}`, subject && `Subject: ${subject}`, body]
      .filter(Boolean)
      .join("\n\n");
    return NextResponse.json({ from, to, subject, text: text.trim() });
  } catch (error) {
    console.error("Parse email route error:", error);
    return NextResponse.json(
      { error: "Failed to parse email" },
      { status: 500 }
    );
  }
}
