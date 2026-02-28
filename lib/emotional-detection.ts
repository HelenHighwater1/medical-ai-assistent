const DISTRESS_KEYWORDS = [
  "scared", "terrified", "afraid", "frightened",
  "going to die", "am i dying", "don't want to",
  "can't do this", "can't handle", "overwhelmed",
  "hopeless", "no hope", "give up", "what's the point",
  "crying", "panic", "anxious", "depressed",
  "don't want to live", "end it", "kill myself",
];

export function detectDistress(text: string): boolean {
  const lower = text.toLowerCase();
  return DISTRESS_KEYWORDS.some((kw) => lower.includes(kw));
}
