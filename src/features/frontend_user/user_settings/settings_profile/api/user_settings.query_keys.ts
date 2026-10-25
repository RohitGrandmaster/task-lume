/**
 * RESPONSIBILITY: Canonical TanStack Query Key factory for user_settings domain.
 * FLOW: Consumed by preferences sync, biometric security state, and backup queries.
 */

export const USER_SETTINGS_QUERY_KEYS = {
  all: ['user_settings'] as const,
  preferences: () => [...USER_SETTINGS_QUERY_KEYS.all, 'preferences'] as const,
  securityState: () => [...USER_SETTINGS_QUERY_KEYS.all, 'securityState'] as const,
  appVersion: () => [...USER_SETTINGS_QUERY_KEYS.all, 'appVersion'] as const,
} as const;
