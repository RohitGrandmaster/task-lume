/**
 * RESPONSIBILITY: Canonical Light Theme implementation for the Luxury Premium Gold mobile design system.
 * FLOW: Consumed by ThemeProvider to provide active light tokens to the application UI.
 */

import type { Tokens, TokenColors } from './tokenDefinitions';
import { STABLE_SCALES } from './tokenDefinitions';

export const lightColors: TokenColors = {
  // Core surfaces (Section 1)
  background: '#F4F4F5',
  foreground: '#000000',
  card: '#FFFFFF',
  cardElevated: '#FAFAFA',
  overlay: '#FFFFFF',
  popover: '#F4F4F5',
  primary: '#EAB308',
  primaryPressed: '#CA8A04',
  primarySubtle: 'rgba(234,179,8,0.15)',
  primaryText: '#EAB308',
  destructive: '#B91C1C',
  border: '#E4E4E7',
  borderFocus: '#A16207',
  muted: '#52525B',
  onPrimary: '#111111',
  onDestructive: '#FFFFFF',
  onSuccess: '#FFFFFF',
  onInfo: '#FFFFFF',
  onWarning: '#111111',
  focusRing: '#A16207',
  skeletonBase: '#E4E4E7',
  skeletonHighlight: '#F4F4F5',
  surfacePressed: 'rgba(234,179,8,0.08)',
  overlayBackdrop: 'rgba(0,0,0,0.6)',

  // Status tokens (Section 8)
  statusSuccessText: '#064E3B',
  statusSuccessBg: '#D1FAE5',
  statusWarningText: '#92400E',
  statusWarningBg: '#FEF3C7',
  statusDangerText: '#7F1D1D',
  statusDangerBg: '#FEE2E2',
  statusInfoText: '#1E3A8A',
  statusInfoBg: '#DBEAFE',
  statusNeutralText: '#3F3F46',
  statusNeutralBg: '#F4F4F5',
  statusPurpleText: '#581C87',
  statusPurpleBg: '#F3E8FF',

  // Payment tokens (Section 8a)
  payCashText: '#0F766E',
  payCashBg: '#CCFBF1',
  payUpiText: '#0E7490',
  payUpiBg: '#CFFAFE',
  payCardText: '#334155',
  payCardBg: '#F1F5F9',
  payBankText: '#0369A1',
  payBankBg: '#E0F2FE',

  // Chart tokens (Section 9)
  chartPrimary: '#EAB308',
  chartSuccess: '#16A34A',
  chartWarning: '#F59E0B',
  chartDanger: '#DC2626',
  chartInfo: '#2563EB',
  chartSecondary: '#7C3AED',
  chartGrid: 'rgba(0,0,0,0.06)',
  chartTooltipBg: '#FFFFFF',
};

export const lightTheme: Tokens = {
  isDark: false,
  color: lightColors,
  colors: lightColors,
  ...STABLE_SCALES,
};
