/**
 * RESPONSIBILITY: Canonical TanStack Query Key factory for user_overview domain.
 * FLOW: Consumed by overview metrics queries and KPI cache invalidation.
 */

export const USER_OVERVIEW_QUERY_KEYS = {
  all: ['user_overview'] as const,
  dashboard: () => [...USER_OVERVIEW_QUERY_KEYS.all, 'dashboard'] as const,
  kpis: () => [...USER_OVERVIEW_QUERY_KEYS.all, 'kpis'] as const,
  charts: (timeframe?: string) => [...USER_OVERVIEW_QUERY_KEYS.all, 'charts', { timeframe }] as const,
  completionRate: () => [...USER_OVERVIEW_QUERY_KEYS.all, 'completionRate'] as const,
} as const;
