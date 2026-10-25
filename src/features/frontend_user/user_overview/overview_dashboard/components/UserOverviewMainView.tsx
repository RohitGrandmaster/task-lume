/**
 * RESPONSIBILITY: Main View component for User Overview screen (≤200 lines).
 * FLOW: Composes KPI metrics, progress rings, charts, and productivity insights using local components.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Flame, Target, Trophy, Clock } from 'lucide-react-native';
import { UserOverviewKPISection } from './UserOverviewKPISection';
import { UserOverviewProgressRing } from './UserOverviewProgressRing';
import { UserOverviewDonutChart } from './UserOverviewDonutChart';
import { UserOverviewActivityBarChart } from './UserOverviewActivityBarChart';
import { UserOverviewCategoryBar } from './UserOverviewCategoryBar';
import { UserOverviewInsightCard } from './UserOverviewInsightCard';
import type { OverviewMetrics } from '../types/user_overview.types';
import { useThemeTokens } from '../../../../../core/theme/useThemeTokens';

interface UserOverviewMainViewProps {
  metrics: OverviewMetrics;
  categoryData: Array<{ label: string; value: number; color?: string }>;
  activityData: Array<{ label: string; value: number; isCurrent?: boolean }>;
  insightText: string;
  refreshing: boolean;
  onRefresh: () => void;
}

export function UserOverviewMainView({
  metrics,
  categoryData,
  activityData,
  insightText,
  refreshing,
  onRefresh,
}: UserOverviewMainViewProps) {
  const tokens = useThemeTokens();
  const maxCategoryVal = Math.max(...categoryData.map((c) => c.value), 1);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: tokens.color.background,
    },
    scrollContent: {
      padding: tokens.space[4],
      paddingBottom: tokens.space[9],
    },
    header: {
      marginBottom: tokens.space[4],
    },
    title: {
      ...tokens.typography.headingLg,
      color: tokens.color.foreground,
    },
    subtitle: {
      ...tokens.typography.bodySm,
      color: tokens.color.muted,
      marginTop: 2,
    },
    chartCard: {
      backgroundColor: tokens.color.card,
      borderRadius: tokens.radius.lg,
      borderWidth: 1,
      borderColor: tokens.color.border,
      padding: tokens.space[4],
      marginBottom: tokens.space[4],
      alignItems: 'center',
    },
    chartTitle: {
      ...tokens.typography.headingSm,
      color: tokens.color.foreground,
      alignSelf: 'flex-start',
      marginBottom: tokens.space[3],
    },
    percentText: {
      ...tokens.typography.kpi,
      fontSize: 28,
      color: tokens.color.foreground,
    },
    percentSub: {
      ...tokens.typography.caption,
      color: tokens.color.muted,
    },
    insightsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: tokens.space[4],
    },
    categoriesList: {
      width: '100%',
      marginTop: tokens.space[2],
    },
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={tokens.color.primary}
          colors={[tokens.color.primary]}
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Productivity Overview</Text>
        <Text style={styles.subtitle}>Track habits, completion rates, and focus</Text>
      </View>

      <UserOverviewKPISection metrics={metrics} />

      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Completion Rate</Text>
        <UserOverviewProgressRing percent={metrics.completionRate} size={130} strokeWidth={12}>
          <Text style={styles.percentText}>{metrics.completionRate}%</Text>
          <Text style={styles.percentSub}>Completed</Text>
        </UserOverviewProgressRing>
      </View>

      <View style={styles.insightsGrid}>
        <UserOverviewInsightCard
          icon={Flame}
          label="Current Streak"
          value={metrics.currentStreak}
          suffix="days"
        />
        <UserOverviewInsightCard
          icon={Clock}
          label="Today Focus"
          value={metrics.todayFocusMinutes}
          suffix="mins"
        />
        <UserOverviewInsightCard
          icon={Target}
          label="Total Tasks"
          value={metrics.totalTasks}
        />
        <UserOverviewInsightCard
          icon={Trophy}
          label="Finished Tasks"
          value={metrics.completedTasks}
        />
      </View>

      {categoryData.length > 0 && (
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Tasks by Category</Text>
          <View style={styles.categoriesList}>
            {categoryData.map((cat, idx) => (
              <UserOverviewCategoryBar
                key={idx}
                item={cat}
                maxValue={maxCategoryVal}
              />
            ))}
          </View>
        </View>
      )}

      {activityData.length > 0 && (
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Weekly Activity</Text>
          <UserOverviewActivityBarChart data={activityData} />
        </View>
      )}
    </ScrollView>
  );
}
