/**
 * RESPONSIBILITY: Canonical type definitions for the user_overview analytics dashboard.
 * FLOW: Consumed by overview metrics, KPI cards, and charts.
 */

export interface OverviewMetrics {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  currentStreak: number;
  totalFocusMinutes: number | null;
  todayFocusMinutes: number | null;
}
