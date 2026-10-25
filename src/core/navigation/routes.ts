/**
 * RESPONSIBILITY: Canonical top-level navigation routes manifest for TaskLume (Rule 4).
 * FLOW: Consumed exclusively by src/core/navigation/ orchestrators; feature screen routes live in feature url_config.ts.
 */

export const CORE_ROUTES = {
  TASK: 'Task',
  REMINDERS: 'Reminders',
  VOICE_MEMOS: 'VoiceMemos',
  SETTINGS: 'Settings',
  TODOS: 'Todos',
  CALENDAR: 'Calendar',
  OVERVIEW: 'Overview',
  POMODORO: 'Pomodoro',
  FAVORITES: 'Favorites',
  CATEGORIES: 'Categories',
  TRASH: 'Trash',
  PROFILE: 'Profile',
  MORE_APPS: 'MoreApps',
  FEEDBACK: 'Feedback',
  FAQ: 'FAQ',
  ABOUT: 'About',
} as const;

export const ROUTES = CORE_ROUTES;

export type CoreRouteKey = keyof typeof CORE_ROUTES;
export type CoreRouteName = typeof CORE_ROUTES[CoreRouteKey];

export type RootDrawerParamList = {
  [CORE_ROUTES.TASK]: undefined;
  [CORE_ROUTES.REMINDERS]: undefined;
  [CORE_ROUTES.VOICE_MEMOS]: undefined;
  [CORE_ROUTES.SETTINGS]: undefined;
  [CORE_ROUTES.TODOS]: undefined;
  [CORE_ROUTES.CALENDAR]: undefined;
  [CORE_ROUTES.OVERVIEW]: undefined;
  [CORE_ROUTES.POMODORO]: undefined;
  [CORE_ROUTES.FAVORITES]: undefined;
  [CORE_ROUTES.CATEGORIES]: undefined;
  [CORE_ROUTES.TRASH]: undefined;
  [CORE_ROUTES.PROFILE]: undefined;
  [CORE_ROUTES.MORE_APPS]: undefined;
  [CORE_ROUTES.FEEDBACK]: undefined;
  [CORE_ROUTES.FAQ]: undefined;
  [CORE_ROUTES.ABOUT]: undefined;
};

