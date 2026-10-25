/**
 * RESPONSIBILITY: Centralized routes and endpoints for user_overview domain.
 * FLOW: Consumed by navigation shells and analytics handlers.
 */

export const USER_OVERVIEW_ROUTES = {
  DASHBOARD: 'UserOverviewDashboard',
} as const;

export const USER_OVERVIEW_ENDPOINTS = {
  METRICS: '/api/v1/user/overview/metrics',
  STATS: '/api/v1/user/overview/stats',
} as const;
