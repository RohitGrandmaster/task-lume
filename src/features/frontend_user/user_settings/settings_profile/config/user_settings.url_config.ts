/**
 * RESPONSIBILITY: Centralized routes and endpoints for user_settings domain.
 * FLOW: Consumed by navigation and settings handlers.
 */

export const USER_SETTINGS_ROUTES = {
  MAIN: 'UserSettingsMain',
  PROFILE: 'UserSettingsProfile',
  FAQ: 'UserSettingsFAQ',
  FEEDBACK: 'UserSettingsFeedback',
  MORE_APPS: 'UserSettingsMoreApps',
  APPS: 'UserSettingsMoreApps',
  ABOUT: 'UserSettingsAbout',
} as const;

export const USER_SETTINGS_ENDPOINTS = {
  PREFERENCES: '/api/v1/user/settings/preferences',
  PROFILE: '/api/v1/user/settings/profile',
  FEEDBACK: '/api/v1/user/settings/feedback',
} as const;

export const USER_SETTINGS_URL_CONFIG = {
  API: { FEEDBACK: USER_SETTINGS_ENDPOINTS.FEEDBACK, PROFILE: USER_SETTINGS_ENDPOINTS.PROFILE, PREFERENCES: USER_SETTINGS_ENDPOINTS.PREFERENCES },
} as const;
