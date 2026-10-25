/**
 * RESPONSIBILITY: Standalone Overview visual harness with populated and empty metrics.
 * FLOW: Harness scenario control → deterministic local analytics props → UserOverviewMainView.
 */

import React, { useState } from 'react';
import { Pressable, View, Text, SafeAreaView } from 'react-native';
import { ThemeProvider } from '../../../../../../core/theme/ThemeProvider';
import { useThemeTokens } from '../../../../../../core/theme/useThemeTokens';
import { UserOverviewMainView } from '../../components/UserOverviewMainView';
import type { OverviewMetrics } from '../../types/user_overview.types';

function HarnessInner({ title, children }: { title: string; children: React.ReactNode }) {
  const tokens = useThemeTokens();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tokens.color.background }}>
      <View style={{ padding: tokens.space[2], backgroundColor: tokens.color.card, borderBottomWidth: 1, borderBottomColor: tokens.color.border }}>
        <Text style={{ color: tokens.color.primary, ...tokens.typography.caption, fontWeight: '700' }}>{title}</Text>
      </View>
      <View style={{ flex: 1 }}>{children}</View>
    </SafeAreaView>
  );
}

function UserOverviewHarnessContent() {
  const tokens = useThemeTokens();
  const [scenario, setScenario] = useState<'ACTIVE_RECORDS' | 'EMPTY_DATA'>('ACTIVE_RECORDS');
  const metrics: OverviewMetrics = scenario === 'EMPTY_DATA'
    ? { totalTasks: 0, completedTasks: 0, completionRate: 0, currentStreak: 0, totalFocusMinutes: 0, todayFocusMinutes: 0 }
    : { totalTasks: 8, completedTasks: 5, completionRate: 63, currentStreak: 2, totalFocusMinutes: 80, todayFocusMinutes: 25 };

  return (
    <HarnessInner title={`Harness: UserOverview [${scenario}]`}>
      <Pressable
        style={{ minHeight: 48, padding: tokens.space[2], backgroundColor: tokens.color.primarySubtle }}
        onPress={() => setScenario((current) => current === 'ACTIVE_RECORDS' ? 'EMPTY_DATA' : 'ACTIVE_RECORDS')}
        accessibilityRole="button"
        accessibilityLabel="Toggle populated and empty Overview scenario"
        testID="user-overview-harness-toggle-scenario"
      >
        <Text style={{ color: tokens.color.foreground }}>Switch to {scenario === 'ACTIVE_RECORDS' ? 'empty' : 'populated'} metrics</Text>
      </Pressable>
      <UserOverviewMainView
        metrics={metrics}
        categoryData={scenario === 'ACTIVE_RECORDS' ? [{ label: 'Work', value: 4 }, { label: 'Personal', value: 4 }] : []}
        activityData={scenario === 'ACTIVE_RECORDS' ? [{ label: 'Mon', value: 2 }, { label: 'Tue', value: 3 }, { label: 'Wed', value: 0 }, { label: 'Thu', value: 1 }, { label: 'Fri', value: 4 }, { label: 'Sat', value: 0 }, { label: 'Sun', value: 2 }] : []}
        insightText={scenario === 'ACTIVE_RECORDS' ? 'Five of eight tasks are complete.' : 'Add a task to start tracking productivity.'}
        refreshing={false}
        onRefresh={() => setScenario('ACTIVE_RECORDS')}
      />
    </HarnessInner>
  );
}

export function UserOverviewHarness() {
  return <ThemeProvider><UserOverviewHarnessContent /></ThemeProvider>;
}
