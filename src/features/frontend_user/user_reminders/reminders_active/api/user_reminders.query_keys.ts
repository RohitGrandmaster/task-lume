/**
 * RESPONSIBILITY: Canonical TanStack Query Key factory for user_reminders domain.
 * FLOW: Consumed by alarms, push notifications sync, and pending reminders queries.
 */

export const USER_REMINDERS_QUERY_KEYS = {
  all: ['user_reminders'] as const,
  active: () => [...USER_REMINDERS_QUERY_KEYS.all, 'active'] as const,
  upcoming: () => [...USER_REMINDERS_QUERY_KEYS.all, 'upcoming'] as const,
  pastDue: () => [...USER_REMINDERS_QUERY_KEYS.all, 'pastDue'] as const,
  detail: (id: string) => [...USER_REMINDERS_QUERY_KEYS.all, 'detail', id] as const,
} as const;
