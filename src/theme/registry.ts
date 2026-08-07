import { THEME_IDS, DEFAULT_THEME_ID, isThemeId, type ThemeId } from "../../lib/themes";
import type { Theme } from "./types";
import { classicTheme } from "./themes/classic";
import { babyTheme } from "./themes/baby";

/** Every theme, keyed by id. Adding a theme = one entry here. */
export const THEMES: Record<ThemeId, Theme> = {
  classic: classicTheme,
  baby_shower: babyTheme,
};

/** Themes in display order — drives the host's theme picker. */
export const THEME_LIST: Theme[] = THEME_IDS.map((id) => THEMES[id]);

/**
 * Resolve whatever came back from the database into a real theme.
 * Sessions created before themes existed have no `theme` field, and an
 * unknown id (rolled-back theme, hand-edited doc) must never blank the UI.
 */
export function resolveTheme(id: string | null | undefined): Theme {
  return isThemeId(id) ? THEMES[id] : THEMES[DEFAULT_THEME_ID];
}
