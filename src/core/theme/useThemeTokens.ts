/**
 * RESPONSIBILITY: Canonical typed theme hook returning active Luxury Premium Gold Tokens.
 * FLOW: Consumed by every styled screen and component to access active design tokens without magic values.
 */

import { useThemeContext } from './ThemeProvider';
import type { Tokens } from './tokenDefinitions';

/**
 * Returns the currently active Tokens object (light or dark).
 * Guarantees zero magic values across all mobile UI.
 */
export function useThemeTokens(): Tokens {
  const { tokens } = useThemeContext();
  return tokens;
}
