/**
 * RESPONSIBILITY: Canonical TanStack Query Key factory for user_calendar domain.
 * FLOW: Consumed by monthly/weekly schedule queries and agenda events sync.
 */

export const USER_CALENDAR_QUERY_KEYS = {
  all: ['user_calendar'] as const,
  agenda: (dateIso: string) => [...USER_CALENDAR_QUERY_KEYS.all, 'agenda', dateIso] as const,
  monthEvents: (yearMonth: string) => [...USER_CALENDAR_QUERY_KEYS.all, 'month', yearMonth] as const,
  today: () => [...USER_CALENDAR_QUERY_KEYS.all, 'today'] as const,
} as const;
