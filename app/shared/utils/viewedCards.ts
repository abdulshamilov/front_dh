/**
 * Lightweight "viewed cards" tracking via localStorage.
 *
 * "Viewed" === the user opened /card/{id}. This is intentionally NOT in
 * Redux — the /map page draws its cards from useMapCards() (its own
 * paginated fetch), and pulling viewed-state through Redux would couple
 * the map back to the cards slice we deliberately keep it away from.
 *
 * SSR-safe: every entry point guards `typeof window` and wraps JSON
 * access in try/catch so a corrupt value can never crash render.
 */

const STORAGE_KEY = "dh_viewed_cards";
// Cap so the array can't grow unbounded across a long browsing session.
const MAX_VIEWED = 200;

/** Mark a card as viewed (idempotent). No-op on the server. */
export function markCardViewed(id: number): void {
  if (typeof window === "undefined") return;
  if (!Number.isFinite(id)) return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    const ids: number[] = Array.isArray(parsed)
      ? parsed.filter((v): v is number => typeof v === "number")
      : [];
    if (ids.includes(id)) return;
    ids.push(id);
    // Keep only the most recent MAX_VIEWED entries.
    const capped =
      ids.length > MAX_VIEWED ? ids.slice(ids.length - MAX_VIEWED) : ids;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(capped));
  } catch {
    // Storage disabled / quota exceeded / bad JSON — silently ignore.
  }
}

/** Read viewed card ids. Returns an empty Set on the server or on error. */
export function getViewedCardIds(): Set<number> {
  if (typeof window === "undefined") return new Set<number>();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set<number>();
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set<number>();
    return new Set<number>(
      parsed.filter((v): v is number => typeof v === "number")
    );
  } catch {
    return new Set<number>();
  }
}
