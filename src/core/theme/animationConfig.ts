/**
 * RESPONSIBILITY: Central animation presets, spring parameters, and reduced-motion evaluation.
 * FLOW: Consumed by animated components, bottom sheets, buttons, and gesture handlers.
 */

import { AccessibilityInfo } from 'react-native';

export const ANIMATION_PRESETS = {
  pressScale: 0.96,
  duration: {
    fast: 150,
    base: 200,
    slow: 300,
    xslow: 500,
  },
  springMedium: {
    damping: 15,
    mass: 1,
    stiffness: 150,
    overshootClamping: false,
    restSpeedThreshold: 0.001,
    restDisplacementThreshold: 0.001,
  },
} as const;

/**
 * Checks if the user has enabled reduced motion at the OS level.
 * @returns Promise<boolean>
 */
export async function checkReduceMotion(): Promise<boolean> {
  try {
    return await AccessibilityInfo.isReduceMotionEnabled();
  } catch {
    return false;
  }
}
