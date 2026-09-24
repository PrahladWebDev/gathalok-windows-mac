import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { themes, themeList, DEFAULT_THEME_ID } from '../theme/themes';

const STORAGE_KEY = 'gathalok:themeId';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved && themes[saved] ? saved : DEFAULT_THEME_ID;
  });

  const setTheme = (id) => {
    if (!themes[id]) return;
    setThemeId(id);
    localStorage.setItem(STORAGE_KEY, id);
  };

  const value = useMemo(
    () => ({ ...themes[themeId], themeId, setTheme, themeList }),
    [themeId]
  );

  // Keep a handful of CSS custom properties in sync so plain CSS (scrollbars,
  // ::placeholder, focus rings) can follow the active theme too.
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--bg', value.colors.bg);
    root.style.setProperty('--surface', value.colors.surface);
    root.style.setProperty('--text', value.colors.text);
    root.style.setProperty('--accent', value.colors.accent);
    root.style.setProperty('--border', value.colors.border);
    root.style.setProperty('color-scheme', value.mode === 'dark' ? 'dark' : 'light');
    document.body.style.backgroundColor = value.colors.bg;
  }, [value]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
