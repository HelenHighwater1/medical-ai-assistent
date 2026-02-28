export default function LoadingDots() {
  return (
    <div
      className="flex items-center gap-1.5"
      role="status"
      aria-label="Loading response"
    >
      <span className="sr-only">Translating your medical record…</span>
      <span
        className="h-2 w-2 rounded-full bg-moss-400 animate-pulse-dot"
        style={{ animationDelay: "0ms" }}
      />
      <span
        className="h-2 w-2 rounded-full bg-moss-400 animate-pulse-dot"
        style={{ animationDelay: "200ms" }}
      />
      <span
        className="h-2 w-2 rounded-full bg-moss-400 animate-pulse-dot"
        style={{ animationDelay: "400ms" }}
      />
    </div>
  );
}
