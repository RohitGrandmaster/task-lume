/**
 * RESPONSIBILITY: Centralized routes and endpoints for user_calendar domain.
 * FLOW: Consumed by navigation shells and date range filters.
 */

export const USER_CALENDAR_ROUTES = {
  AGENDA: 'UserCalendarAgenda',
} as const;

export const USER_CALENDAR_ENDPOINTS = {
  MONTH: '/api/v1/user/calendar/month',
  DAY: '/api/v1/user/calendar/day',
  AGENDA: '/api/v1/user/calendar/agenda',
} as const;

export const USER_CALENDAR_URL_CONFIG = {
  API: { MONTH: USER_CALENDAR_ENDPOINTS.MONTH, DAY: USER_CALENDAR_ENDPOINTS.DAY },
} as const;
