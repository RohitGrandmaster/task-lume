/**
 * RESPONSIBILITY: Canonical feature hook for User Overview Dashboard (≤150 lines).
 * FLOW: Computes productivity KPIs and provides refreshed metrics to UI.
 */

import { useMemo, useState, useCallback } from 'react';
import { useTodoContext } from '../../../../../context/TodoContext';
import { buildWeeklyCompletionActivity, calculateTaskCompletionStreak, type OverviewTaskRecord } from '../utils/userOverviewAnalytics';

export function useUserOverview() {
  const todoCtx = useTodoContext();
  const tasks = (todoCtx?.tasks ?? []) as OverviewTaskRecord[];
  const loadTodos = todoCtx?.loadTodos;
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (loadTodos) await loadTodos();
    } finally {
      setRefreshing(false);
    }
  }, [loadTodos]);

  const metrics = useMemo(() => {
    const valid = tasks.filter((task) => task.deleted !== true);
    const completed = valid.filter((task) => task.completed === true).length;
    const total = valid.length;
    return {
      totalTasks: total,
      completedTasks: completed,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      currentStreak: calculateTaskCompletionStreak(valid),
      // No verified source currently records completed focus-session minutes.
      totalFocusMinutes: null,
      todayFocusMinutes: null,
    };
  }, [tasks]);

  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    tasks.filter((task) => task.deleted !== true).forEach((task) => {
      const c = task.category || 'Personal';
      counts[c] = (counts[c] || 0) + 1;
    });
    return Object.entries(counts).map(([label, value]) => ({ label, value }));
  }, [tasks]);

  const activityData = useMemo(() => buildWeeklyCompletionActivity(tasks), [tasks]);

  return {
    metrics,
    categoryData,
    activityData,
    refreshing,
    refresh,
  };
}
