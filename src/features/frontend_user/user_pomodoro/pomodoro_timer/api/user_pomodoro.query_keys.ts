/**
 * RESPONSIBILITY: Canonical TanStack Query Key factory for user_pomodoro domain.
 * FLOW: Consumed by pomodoro analytics queries and session history sync.
 */

export const USER_POMODORO_QUERY_KEYS = {
  all: ['user_pomodoro'] as const,
  activeSession: () => [...USER_POMODORO_QUERY_KEYS.all, 'activeSession'] as const,
  history: (limit?: number) => [...USER_POMODORO_QUERY_KEYS.all, 'history', { limit }] as const,
  stats: () => [...USER_POMODORO_QUERY_KEYS.all, 'stats'] as const,
  settings: () => [...USER_POMODORO_QUERY_KEYS.all, 'settings'] as const,
} as const;
