/**
 * RESPONSIBILITY: Centralized routes and endpoints for user_calendar domain.
 * FLOW: Consumed by navigation shells and date range filters.
 */

export const USER_CALENDAR_ROUTES = {
  AGENDA: 'UserCalendarAgenda',
} as const;

export const USER_CALENDAR_ENDPOINTS = {
  AGENDA: '/api/v1/user/calendar/agenda',
} as const;

/** Compatibility view for the API service; MONTH uses the documented agenda endpoint. */
export const USER_CALENDAR_URL_CONFIG = {
  API: { MONTH: USER_CALENDAR_ENDPOINTS.AGENDA },
} as const;
