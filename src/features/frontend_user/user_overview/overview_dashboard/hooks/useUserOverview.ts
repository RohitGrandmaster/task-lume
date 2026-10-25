/**
 * RESPONSIBILITY: Computes Todo analytics and loads actual local Pomodoro focus history.
 * FLOW: UserOverviewScreen → this hook → TodoContext + feature-local focus metrics helper.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTodoContext } from '../../../../../context/TodoContext';
import { getOverviewDateKey, loadUserOverviewFocusStats, type UserOverviewFocusStats } from '../utils/userOverviewFocusStats';
import type { OverviewMetrics } from '../types/user_overview.types';

interface OverviewTask {
  id: string | number;
  title?: string;
  completed: boolean;
  deleted?: boolean;
  category?: string | null;
  completedAt?: string | number | null;
}

const EMPTY_FOCUS_STATS: UserOverviewFocusStats = {
  totalFocusMinutes: 0,
  todayFocusMinutes: 0,
  currentFocusStreak: 0,
};

/**
 * Builds analytics from task records and persisted focus sessions; missing history remains zero.
 *
 * @returns Overview KPIs, live category/day aggregates, insight copy, and refresh controls.
 */
export function useUserOverview() {
  const { tasks, loadTodos } = useTodoContext();
  const [refreshing, setRefreshing] = useState(false);
  const [focusStats, setFocusStats] = useState<UserOverviewFocusStats>(EMPTY_FOCUS_STATS);

  const refreshFocusStats = useCallback(async () => {
    const nextStats = await loadUserOverviewFocusStats();
    setFocusStats(nextStats);
  }, []);

  useEffect(() => {
    void refreshFocusStats();
    // refreshFocusStats is stable and runs once on mount; foreground recovery remains host-dependent.
  }, [refreshFocusStats]);

  const refreshOverview = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        typeof loadTodos === 'function' ? loadTodos() : Promise.resolve(),
        refreshFocusStats(),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [loadTodos, refreshFocusStats]);

  const metrics = useMemo<OverviewMetrics>(() => {
    const records = (Array.isArray(tasks) ? tasks : []) as OverviewTask[];
    const activeTasks = records.filter((task) => !task.deleted);
    const completedTasks = activeTasks.filter((task) => task.completed).length;
    return {
      totalTasks: activeTasks.length,
      completedTasks,
      completionRate: activeTasks.length > 0 ? Math.round((completedTasks / activeTasks.length) * 100) : 0,
      currentStreak: focusStats.currentFocusStreak,
      totalFocusMinutes: Math.round(focusStats.totalFocusMinutes),
      todayFocusMinutes: Math.round(focusStats.todayFocusMinutes),
    };
  }, [tasks, focusStats]);

  const categoryData = useMemo(() => {
    const records = (Array.isArray(tasks) ? tasks : []) as OverviewTask[];
    const counts: Record<string, number> = {};
    records.filter((task) => !task.deleted).forEach((task) => {
      const category = task.category?.trim() || 'Uncategorized';
      counts[category] = (counts[category] || 0) + 1;
    });
    return Object.entries(counts).map(([label, value]) => ({ label, value }));
  }, [tasks]);

  const activityData = useMemo(() => {
    const records = (Array.isArray(tasks) ? tasks : []) as OverviewTask[];
    const completedCounts: Record<string, number> = {};
    records.filter((task) => task.completed && !task.deleted && task.completedAt != null).forEach((task) => {
      const date = typeof task.completedAt === 'number' ? new Date(task.completedAt) : new Date(String(task.completedAt));
      if (!Number.isNaN(date.getTime())) {
        const key = getOverviewDateKey(date);
        completedCounts[key] = (completedCounts[key] || 0) + 1;
      }
    });
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      const key = getOverviewDateKey(date);
      return {
        label: date.toLocaleDateString(undefined, { weekday: 'short' }),
        value: completedCounts[key] || 0,
        isCurrent: index === 6,
      };
    });
  }, [tasks]);

  const insightText = useMemo(() => {
    if (metrics.totalTasks === 0) return 'Add your first task to begin tracking productivity.';
    return `${metrics.completedTasks} of ${metrics.totalTasks} active tasks are complete. Focus history records ${metrics.totalFocusMinutes} work minutes.`;
  }, [metrics]);

  return {
    metrics,
    categoryData,
    activityData,
    insightText,
    refreshing,
    refreshOverview,
  };
}
