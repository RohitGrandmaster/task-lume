/**
 * RESPONSIBILITY: Global Theme Context and Provider resolving active Luxury Premium Gold tokens.
 * FLOW: Wraps app root; provides active Tokens, theme toggle function, and dark mode state to the component tree.
 */

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Tokens } from './tokenDefinitions';
import { darkTheme } from './darkTheme';
import { lightTheme } from './lightTheme';

const THEME_STORAGE_KEY = '@todomaster/theme_mode';

interface ThemeContextValue {
  tokens: Tokens;
  isDarkMode: boolean;
  toggleTheme: () => void;
  setDarkMode: (enabled: boolean) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export interface ThemeProviderProps {
  children: React.ReactNode;
  initialDarkMode?: boolean;
}

export function ThemeProvider({ children, initialDarkMode }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof initialDarkMode === 'boolean') {
      return initialDarkMode;
    }
    return systemColorScheme !== 'light';
  });

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((saved) => {
        if (!mounted || !saved) return;
        if (saved === 'dark') setIsDarkMode(true);
        if (saved === 'light') setIsDarkMode(false);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const toggleTheme = React.useCallback(() => {
    setIsDarkMode((prev) => {
      const next = !prev;
      AsyncStorage.setItem(THEME_STORAGE_KEY, next ? 'dark' : 'light').catch(() => {});
      return next;
    });
  }, []);

  const setDarkMode = React.useCallback((enabled: boolean) => {
    setIsDarkMode(enabled);
    AsyncStorage.setItem(THEME_STORAGE_KEY, enabled ? 'dark' : 'light').catch(() => {});
  }, []);

  const tokens = useMemo(() => {
    return isDarkMode ? darkTheme : lightTheme;
  }, [isDarkMode]);

  const value = useMemo<ThemeContextValue>(() => ({
    tokens,
    isDarkMode,
    toggleTheme,
    setDarkMode,
  }), [tokens, isDarkMode, toggleTheme, setDarkMode]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Access the complete Theme Context including toggle methods.
 */
export function useThemeContext(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
}
