/**
 * RESPONSIBILITY: Global Theme Context and Provider resolving active Luxury Premium Gold tokens.
 * FLOW: Wraps app root; provides active Tokens, theme toggle function, and dark mode state to the component tree.
 */

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import type { Tokens } from './tokenDefinitions';
import { darkTheme } from './darkTheme';
import { lightTheme } from './lightTheme';

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
    if (typeof initialDarkMode !== 'boolean' && systemColorScheme) {
      setIsDarkMode(systemColorScheme !== 'light');
    }
  }, [systemColorScheme, initialDarkMode]);

  const toggleTheme = React.useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, []);

  const setDarkMode = React.useCallback((enabled: boolean) => {
    setIsDarkMode(enabled);
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
