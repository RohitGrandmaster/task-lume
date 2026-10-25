/**
 * RESPONSIBILITY: Centralized routes and endpoints for user_reminders domain.
 * FLOW: Consumed by navigation and reminder scheduling services.
 */

export const USER_REMINDERS_ROUTES = {
  LIST: 'UserRemindersList',
} as const;

export const USER_REMINDERS_ENDPOINTS = {
  ACTIVE: '/api/v1/user/reminders/active',
} as const;
