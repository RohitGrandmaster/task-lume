/**
 * RESPONSIBILITY: Resolves platform-native elevation/shadow styles (iOS shadow properties and Android elevation).
 * FLOW: Called by cards, modals, sheets, and elevated surfaces across feature UI.
 */

import { Platform, type ViewStyle } from 'react-native';

export type ShadowLevel = 'sm' | 'md' | 'lg' | 'xl';

interface ShadowConfig {
  opacity: number;
  radius: number;
  elevation: number;
  offsetY: number;
}

const SHADOW_CONFIGS: Record<ShadowLevel, ShadowConfig> = {
  sm: { opacity: 0.05, radius: 2, elevation: 1, offsetY: 1 },
  md: { opacity: 0.1, radius: 6, elevation: 3, offsetY: 2 },
  lg: { opacity: 0.15, radius: 12, elevation: 8, offsetY: 4 },
  xl: { opacity: 0.2, radius: 20, elevation: 16, offsetY: 8 },
};

/**
 * Returns platform-native shadow styling for a given elevation level.
 * @param level - 'sm' | 'md' | 'lg' | 'xl'
 * @param shadowColor - Color string for the shadow (default '#000000')
 */
export function getShadowStyle(level: ShadowLevel, shadowColor: string = '#000000'): ViewStyle {
  const config = SHADOW_CONFIGS[level];

  if (Platform.OS === 'android') {
    return {
      elevation: config.elevation,
    };
  }

  return {
    shadowColor,
    shadowOffset: { width: 0, height: config.offsetY },
    shadowOpacity: config.opacity,
    shadowRadius: config.radius,
  };
}
