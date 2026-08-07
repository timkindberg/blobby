/**
 * Theme identity — shared by the Convex backend and the frontend.
 *
 * Themes are PURELY COSMETIC. They swap palettes and add decorative blob
 * accessories; they never change elevation, scoring, or question flow.
 * Only the theme *id* is stored in the database — the actual look lives in
 * `src/theme/themes/` so the backend never needs to know about colors.
 *
 * Adding a theme:
 *   1. Add its id here.
 *   2. Add the matching literal to `themeValidator` in `convex/schema.ts`
 *      (a compile-time guard there will fail until you do).
 *   3. Add a `Theme` definition in `src/theme/themes/` and register it in
 *      `src/theme/registry.ts`.
 */
export const THEME_IDS = ["classic", "baby_shower"] as const;

export type ThemeId = (typeof THEME_IDS)[number];

/** Theme used when a session has no theme set (all pre-existing sessions). */
export const DEFAULT_THEME_ID: ThemeId = "classic";

/** Narrow an unknown value (e.g. a session field from an older document). */
export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === "string" && (THEME_IDS as readonly string[]).includes(value);
}
