/**
 * RESPONSIBILITY: Resolves platform-specific minimum touch target dimension (iOS 44pt / Android 48dp).
 * FLOW: Called by interactive components and buttons across all features to guarantee accessibility touch targets.
 */

import { Platform } from 'react-native';

/**
 * Returns the platform-specific minimum touch target in layout units.
 * iOS = 44pt, Android = 48dp.
 */
export function getMinTouchTarget(): number {
  return Platform.OS === 'ios' ? 44 : 48;
}
