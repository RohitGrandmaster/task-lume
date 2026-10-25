/**
 * RESPONSIBILITY: Stable non-theme design token scales (space, radius, layout, zIndex, animation durations).
 * FLOW: Imported by darkTheme, lightTheme, and token contracts to ensure universal consistency.
 */

export const STABLE_SCALES = {
  opacity: {
    disabled: 0.5,
    loading: 0.7,
    masked: 0.8,
  },
  space: {
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    7: 32,
    8: 40,
    9: 48,
  },
  typography: {
    caption: { fontSize: 12, lineHeight: 18, letterSpacing: 0.5, fontWeight: '400' as const },
    bodySm: { fontSize: 14, lineHeight: 21, letterSpacing: 0, fontWeight: '400' as const },
    body: { fontSize: 16, lineHeight: 24, letterSpacing: 0, fontWeight: '400' as const },
    headingSm: { fontSize: 18, lineHeight: 22, letterSpacing: -0.5, fontWeight: '600' as const },
    headingLg: { fontSize: 22, lineHeight: 28, letterSpacing: -0.5, fontWeight: '700' as const },
    kpi: { fontSize: 28, lineHeight: 34, letterSpacing: -1, fontWeight: '700' as const },
    labelUppercase: { fontSize: 11, lineHeight: 16, letterSpacing: 1, fontWeight: '600' as const },
  },
  radius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  icon: {
    sm: 16,
    md: 20,
    lg: 24,
    stroke: 1.75,
  },
  layout: {
    buttonMinWidth: 120,
    minTouchTargetIos: 44,
    minTouchTargetAndroid: 48,
    headerHeight: 56,
    bottomTabHeight: 60,
    contentPadding: 16,
    cardPadding: 16,
    fabSize: 56,
  },
  duration: {
    fast: 150,
    base: 200,
    slow: 300,
    xslow: 500,
  },
  pressScale: 0.96,
  shadow: {
    sm: { opacity: 0.05, radius: 2, elevation: 1 },
    md: { opacity: 0.1, radius: 6, elevation: 3 },
    lg: { opacity: 0.15, radius: 12, elevation: 8 },
    xl: { opacity: 0.2, radius: 20, elevation: 16 },
  },
  zIndex: {
    base: 0,
    sticky: 10,
    fab: 20,
    bottomTab: 30,
    bottomSheet: 40,
    modal: 50,
    toast: 60,
    overlay: 70,
  },
} as const;
