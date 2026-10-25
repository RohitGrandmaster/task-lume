/**
 * RESPONSIBILITY: Canonical TypeScript interface for the Mobile Luxury Gold Design System.
 * FLOW: Imported across features and theme providers to enforce exact token property typing.
 */

export interface TokenColors {
  // Core surfaces (Section 1)
  background: string;
  foreground: string;
  card: string;
  cardElevated: string;
  overlay: string;
  popover: string;
  primary: string;
  primaryPressed: string;
  primarySubtle: string;
  primaryText: string;
  destructive: string;
  border: string;
  borderFocus: string;
  muted: string;
  onPrimary: string;
  onDestructive: string;
  onSuccess: string;
  onInfo: string;
  onWarning: string;
  focusRing: string;
  skeletonBase: string;
  skeletonHighlight: string;
  surfacePressed: string;
  overlayBackdrop: string;

  // Status tokens (Section 8)
  statusSuccessText: string;
  statusSuccessBg: string;
  statusWarningText: string;
  statusWarningBg: string;
  statusDangerText: string;
  statusDangerBg: string;
  statusInfoText: string;
  statusInfoBg: string;
  statusNeutralText: string;
  statusNeutralBg: string;
  statusPurpleText: string;
  statusPurpleBg: string;

  // Payment tokens (Section 8a)
  payCashText: string;
  payCashBg: string;
  payUpiText: string;
  payUpiBg: string;
  payCardText: string;
  payCardBg: string;
  payBankText: string;
  payBankBg: string;

  // Chart tokens (Section 9)
  chartPrimary: string;
  chartSuccess: string;
  chartWarning: string;
  chartDanger: string;
  chartInfo: string;
  chartSecondary: string;
  chartGrid: string;
  chartTooltipBg: string;
}

export interface TypographyToken {
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  fontWeight: '400' | '600' | '700';
}

export interface ShadowToken {
  opacity: number;
  radius: number;
  elevation: number;
}

export interface Tokens {
  isDark: boolean;
  color: TokenColors;
  colors: TokenColors;
  opacity: {
    disabled: number;
    loading: number;
    masked: number;
  };
  space: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
    6: number;
    7: number;
    8: number;
    9: number;
  };
  typography: {
    caption: TypographyToken;
    bodySm: TypographyToken;
    body: TypographyToken;
    headingSm: TypographyToken;
    headingLg: TypographyToken;
    kpi: TypographyToken;
    labelUppercase: TypographyToken;
  };
  radius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    full: number;
  };
  icon: {
    sm: number;
    md: number;
    lg: number;
    stroke: number;
  };
  layout: {
    buttonMinWidth: number;
    minTouchTargetIos: number;
    minTouchTargetAndroid: number;
    headerHeight: number;
    bottomTabHeight: number;
    contentPadding: number;
    cardPadding: number;
    fabSize: number;
  };
  duration: {
    fast: number;
    base: number;
    slow: number;
    xslow: number;
  };
  pressScale: number;
  shadow: {
    sm: ShadowToken;
    md: ShadowToken;
    lg: ShadowToken;
    xl: ShadowToken;
  };
  zIndex: {
    base: number;
    sticky: number;
    fab: number;
    bottomTab: number;
    bottomSheet: number;
    modal: number;
    toast: number;
    overlay: number;
  };
}

export { STABLE_SCALES } from './stableScales';
