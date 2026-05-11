function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

function lineMatchesPantry(line: string, pantryPhrases: string[]): boolean {
  const n = normalize(line);
  if (!n) return false;
  for (const phrase of pantryPhrases) {
    const p = normalize(phrase);
    if (!p) continue;
    if (n.includes(p)) return true;
    const words = p.split(" ").filter((w) => w.length > 2);
    if (words.length > 0 && words.some((w) => n.includes(w))) return true;
  }
  return false;
}

export type PantryMatchResult = {
  matchedLines: number;
  totalLines: number;
  missingCount: number;
  matchPercent: number;
  /** Up to 5 unmatched ingredient lines for shopping hints. */
  missingSample: string[];
};

export function computePantryMatch(pantryNames: string[], ingredientLines: string[]): PantryMatchResult {
  const phrases = pantryNames.map(normalize).filter(Boolean);
  const lines = ingredientLines.filter((l) => l.trim().length > 0);
  if (lines.length === 0) {
    return { matchedLines: 0, totalLines: 0, missingCount: 0, matchPercent: 0, missingSample: [] };
  }
  if (phrases.length === 0) {
    return {
      matchedLines: 0,
      totalLines: lines.length,
      missingCount: lines.length,
      matchPercent: 0,
      missingSample: lines.slice(0, 5),
    };
  }
  const missing: string[] = [];
  let matched = 0;
  for (const line of lines) {
    if (lineMatchesPantry(line, phrases)) {
      matched++;
    } else if (missing.length < 8) {
      missing.push(line);
    }
  }
  const matchPercent = Math.round((matched / lines.length) * 100);
  return {
    matchedLines: matched,
    totalLines: lines.length,
    missingCount: lines.length - matched,
    matchPercent,
    missingSample: missing.slice(0, 5),
  };
}

export type SortMode = "best_match" | "fewest_missing";

export function compareRecipeMatches(
  a: PantryMatchResult,
  b: PantryMatchResult,
  mode: SortMode
): number {
  if (mode === "fewest_missing") {
    if (a.missingCount !== b.missingCount) return a.missingCount - b.missingCount;
    return b.matchPercent - a.matchPercent;
  }
  if (b.matchPercent !== a.matchPercent) return b.matchPercent - a.matchPercent;
  return a.missingCount - b.missingCount;
}
