/**
 * RESPONSIBILITY: Canonical Dark Theme implementation for the Luxury Premium Gold mobile design system.
 * FLOW: Consumed by ThemeProvider to provide active dark tokens to the application UI.
 */

import type { Tokens, TokenColors } from './tokenDefinitions';
import { STABLE_SCALES } from './tokenDefinitions';

export const darkColors: TokenColors = {
  // Core surfaces (Section 1)
  background: '#050505',
  foreground: '#FFFFFF',
  card: '#111111',
  cardElevated: '#1A1A1A',
  overlay: '#242424',
  popover: '#2E2E2E',
  primary: '#FACC15',
  primaryPressed: '#EAB308',
  primarySubtle: 'rgba(250,204,21,0.15)',
  primaryText: '#FACC15',
  destructive: '#B91C1C',
  border: '#27272A',
  borderFocus: '#FACC15',
  muted: '#A1A1AA',
  onPrimary: '#111111',
  onDestructive: '#FFFFFF',
  onSuccess: '#FFFFFF',
  onInfo: '#FFFFFF',
  onWarning: '#111111',
  focusRing: '#FACC15',
  skeletonBase: '#111111',
  skeletonHighlight: '#1A1A1A',
  surfacePressed: 'rgba(250,204,21,0.08)',
  overlayBackdrop: 'rgba(0,0,0,0.6)',

  // Status tokens (Section 8)
  statusSuccessText: '#86EFAC',
  statusSuccessBg: '#064E3B',
  statusWarningText: '#F59E0B',
  statusWarningBg: '#451A03',
  statusDangerText: '#FCA5A5',
  statusDangerBg: '#450A0A',
  statusInfoText: '#93C5FD',
  statusInfoBg: '#1E3A5F',
  statusNeutralText: '#A1A1AA',
  statusNeutralBg: '#1E1E2E',
  statusPurpleText: '#C084FC',
  statusPurpleBg: '#3B0764',

  // Payment tokens (Section 8a)
  payCashText: '#5EEAD4',
  payCashBg: '#134E4A',
  payUpiText: '#67E8F9',
  payUpiBg: '#164E63',
  payCardText: '#94A3B8',
  payCardBg: '#1E293B',
  payBankText: '#7DD3FC',
  payBankBg: '#0C4A6E',

  // Chart tokens (Section 9)
  chartPrimary: '#FACC15',
  chartSuccess: '#4ADE80',
  chartWarning: '#FBBF24',
  chartDanger: '#F87171',
  chartInfo: '#60A5FA',
  chartSecondary: '#D8B4FE',
  chartGrid: 'rgba(255,255,255,0.05)',
  chartTooltipBg: '#111111',
};

export const darkTheme: Tokens = {
  isDark: true,
  color: darkColors,
  colors: darkColors,
  ...STABLE_SCALES,
};
