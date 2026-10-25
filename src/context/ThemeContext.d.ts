/**
 * RESPONSIBILITY: Public TypeScript contract for stored light/dark mode and accent palettes.
 * FLOW: Drawer theme controls call setAccentColor/toggleTheme; palette values originate in constants/colors.
 */

import type { ComponentType, ReactNode } from 'react';

export interface AccentPalette {
  id: string;
  name: string;
  light: string;
  dark: string;
}

export interface LegacyThemeContextValue {
  theme: Record<string, unknown>;
  mode: 'light' | 'dark';
  toggleTheme: () => void;
  accentColor: string;
  setAccentColor: (colorId: string) => void;
  palettes: AccentPalette[];
  loading: boolean;
}

export const ThemeProvider: ComponentType<{ children?: ReactNode }>;
export function useThemeContext(): LegacyThemeContextValue;
