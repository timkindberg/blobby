import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { DEFAULT_THEME_ID, isThemeId, type ThemeId } from "../../lib/themes";
import { THEMES, resolveTheme } from "./registry";
import type { Theme } from "./types";
import "./themes.css";

interface ThemeContextValue {
  theme: Theme;
  themeId: ThemeId;
  setThemeId: (id: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: THEMES[DEFAULT_THEME_ID],
  themeId: DEFAULT_THEME_ID,
  setThemeId: () => {},
});

/**
 * Holds the active theme for the whole app.
 *
 * The theme lives in a provider rather than being threaded through props
 * because the ~10 `<Blob>` call sites and every mountain layer would otherwise
 * each need a `theme` prop. Views push the session's theme up via
 * `useApplyTheme` (see below) instead of the provider fetching it, so this
 * component stays free of Convex and works in tests and the blob gallery.
 */
export function ThemeProvider({
  children,
  initialThemeId = DEFAULT_THEME_ID,
}: {
  children: ReactNode;
  initialThemeId?: ThemeId;
}) {
  const [themeId, setThemeId] = useState<ThemeId>(initialThemeId);

  // Mirror onto <html> so plain CSS (page backgrounds, buttons) can theme too.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", themeId);
  }, [themeId]);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme: THEMES[themeId], themeId, setThemeId }),
    [themeId]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/** The active theme. Safe outside a provider — falls back to classic. */
export function useTheme(): Theme {
  return useContext(ThemeContext).theme;
}

/** Read/write access to the active theme id (theme pickers, gallery preview). */
export function useThemeControls(): { themeId: ThemeId; setThemeId: (id: ThemeId) => void } {
  const { themeId, setThemeId } = useContext(ThemeContext);
  return { themeId, setThemeId };
}

/**
 * Apply a session's theme to the whole app.
 *
 * Views call this once, right after their session query — no JSX restructuring
 * around their many early returns. Falls back to classic while the session is
 * still loading and on unmount, so leaving a themed session un-themes the app.
 */
export function useApplyTheme(sessionTheme: string | null | undefined): void {
  const { setThemeId } = useContext(ThemeContext);

  useEffect(() => {
    setThemeId(isThemeId(sessionTheme) ? sessionTheme : DEFAULT_THEME_ID);
  }, [sessionTheme, setThemeId]);

  useEffect(() => {
    return () => setThemeId(DEFAULT_THEME_ID);
  }, [setThemeId]);
}

export { resolveTheme };
