/**
 * Parse a price value (string or number) to a clean integer.
 *
 * Handles:
 * - numbers (returned as-is when finite, rounded)
 * - strings with spaces, currency symbols, non-digit decorations
 * - undefined/null/empty → 0
 */
export function parsePriceToNumber(
  raw: string | number | undefined | null
): number {
  if (raw === undefined || raw === null) return 0;
  if (typeof raw === "number") return isFinite(raw) ? Math.round(raw) : 0;
  const cleaned = String(raw).replace(/[^0-9.]/g, "");
  if (!cleaned) return 0;
  const n = Number(cleaned);
  return isFinite(n) ? Math.round(n) : 0;
}
