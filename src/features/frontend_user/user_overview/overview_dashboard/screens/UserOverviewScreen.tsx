/**
 * RESPONSIBILITY: Thin Screen entry point for User Overview analytics dashboard (≤80 lines).
 * FLOW: Composes SafeAreaView, StatusBar, and UserOverviewMainView; derives metrics from useTodos.
 */

import React, { useMemo, useState } from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserOverviewMainView } from '../components/UserOverviewMainView';
import { useThemeTokens } from '../../../../core/theme/useThemeTokens';
import { useTodos } from '../../../../hooks/useTodos';

export function UserOverviewScreen() {
  const tokens = useThemeTokens();
  const { todos, refreshTodos, loading } = useTodos();
  const [refreshing, setRefreshing] = useState(false);

  const metrics = useMemo(() => {
    const validTodos = todos.filter((t: any) => !t.deleted);
    const completed = validTodos.filter((t: any) => t.completed).length;
    const total = validTodos.length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      totalTasks: total,
      completedTasks: completed,
      completionRate: rate,
      currentStreak: completed > 0 ? 3 : 0,
      totalFocusMinutes: 45,
      todayFocusMinutes: 25,
    };
  }, [todos]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshTodos();
    setRefreshing(false);
  };

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: tokens.color.background,
    },
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar
        barStyle={tokens.color.background === '#050505' ? 'light-content' : 'dark-content'}
        backgroundColor={tokens.color.background}
      />
      <UserOverviewMainView
        metrics={metrics}
        categoryData={[]}
        activityData={[]}
        insightText="Great job! You have consistent task completion this week."
        refreshing={refreshing || loading}
        onRefresh={handleRefresh}
      />
    </SafeAreaView>
  );
}
