/**
 * RESPONSIBILITY: Main View component for the User Overview screen.
 * FLOW: Composes KPI metrics, progress rings, charts, and productivity insights.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { UserOverviewKPISection } from './UserOverviewKPISection';
import type { OverviewMetrics } from '../types/user_overview.types';
import { useThemeTokens } from '../../../../core/theme/useThemeTokens';
import ProgressRing from '../../../../components/overview/ProgressRing';
import DonutChart from '../../../../components/overview/DonutChart';
import ActivityBarChart from '../../../../components/overview/ActivityBarChart';
import InsightCard from '../../../../components/overview/InsightCard';

interface UserOverviewMainViewProps {
  metrics: OverviewMetrics;
  categoryData: any[];
  activityData: any[];
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
      marginBottom: tokens.space[1],
    },
    subtitle: {
      ...tokens.typography.bodySm,
      color: tokens.color.muted,
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
        <Text style={styles.title}>Overview</Text>
        <Text style={styles.subtitle}>Track your productivity and habits</Text>
      </View>

      <UserOverviewKPISection metrics={metrics} />

      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Daily Completion</Text>
        <ProgressRing progress={metrics.completionRate / 100} size={150} strokeWidth={14} />
      </View>

      {Boolean(insightText) && (
        <InsightCard
          insight={{
            text: insightText,
            type: 'positive',
          }}
        />
      )}

      {categoryData.length > 0 && (
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Tasks by Category</Text>
          <DonutChart data={categoryData} size={160} />
        </View>
      )}

      {activityData.length > 0 && (
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Weekly Activity</Text>
          <ActivityBarChart data={activityData} />
        </View>
      )}
    </ScrollView>
  );
}
