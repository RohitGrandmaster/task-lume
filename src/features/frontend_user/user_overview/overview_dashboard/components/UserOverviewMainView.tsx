/**
 * RESPONSIBILITY: Main View component for User Overview screen (≤180 lines).
 * FLOW: Composes drawer header, KPI metrics, progress rings, charts, and productivity insights using local components.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Pressable } from 'react-native';
import { Flame, Target, Trophy, Clock, Menu } from 'lucide-react-native';
import { UserOverviewKPISection } from './UserOverviewKPISection';
import { UserOverviewCompletionCard } from './UserOverviewCompletionCard';
import { UserOverviewDonutChart } from './UserOverviewDonutChart';
import { UserOverviewActivityBarChart } from './UserOverviewActivityBarChart';
import { UserOverviewCategoryBar } from './UserOverviewCategoryBar';
import { UserOverviewInsightCard } from './UserOverviewInsightCard';
import type { OverviewMetrics } from '../types/user_overview.types';
import { useThemeTokens } from '../../../../../core/theme/useThemeTokens';
import { getMinTouchTarget } from '../../../../../core/theme/getMinTouchTarget';
import { triggerLightImpact } from '../../../../../core/interaction/haptics';

interface UserOverviewMainViewProps {
  metrics: OverviewMetrics;
  categoryData: Array<{ label: string; value: number; color?: string }>;
  activityData: Array<{ label: string; value: number; isCurrent?: boolean }>;
  insightText: string;
  refreshing: boolean;
  onRefresh: () => void;
  onOpenDrawer?: () => void;
}

export function UserOverviewMainView({
  metrics,
  categoryData,
  activityData,
  insightText,
  refreshing,
  onRefresh,
  onOpenDrawer,
}: UserOverviewMainViewProps) {
  const tokens = useThemeTokens();
  const minTarget = getMinTouchTarget();
  const maxCategoryVal = Math.max(...categoryData.map((c) => c.value), 1);

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: tokens.color.background },
    scrollContent: { padding: tokens.space[4], paddingBottom: 110 },
    header: { marginBottom: tokens.space[4] },
    headerRow: { flexDirection: 'row', alignItems: 'center' },
    iconBtn: {
      width: minTarget,
      height: minTarget,
      borderRadius: tokens.radius.md,
      backgroundColor: tokens.color.card,
      borderWidth: 1,
      borderColor: tokens.color.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: tokens.space[3],
    },
    title: { ...tokens.typography.headingLg, color: tokens.color.foreground },
    subtitle: { ...tokens.typography.bodySm, color: tokens.color.muted, marginTop: 2 },
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
    insightsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: tokens.space[4],
    },
    categoriesList: { width: '100%', marginTop: tokens.space[2] },
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
        <View style={styles.headerRow}>
          {onOpenDrawer ? (
            <Pressable
              style={styles.iconBtn}
              onPress={() => {
                triggerLightImpact();
                onOpenDrawer();
              }}
              accessibilityRole="button"
              accessibilityLabel="Open navigation drawer"
              hitSlop={8}
            >
              <Menu size={20} color={tokens.color.foreground} strokeWidth={2.2} />
            </Pressable>
          ) : null}
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Productivity Overview</Text>
            <Text style={styles.subtitle}>Track habits, completion rates, and focus</Text>
          </View>
        </View>
      </View>

      <UserOverviewKPISection metrics={metrics} />

      <UserOverviewCompletionCard completionRate={metrics.completionRate} />

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
          label="Total Focus"
          value={metrics.totalFocusMinutes}
          suffix="mins"
        />
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Last 7 Days Activity</Text>
        <UserOverviewActivityBarChart data={activityData} />
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Tasks by Category</Text>
        <UserOverviewDonutChart data={categoryData} />
        <View style={styles.categoriesList}>
          {categoryData.map((item, index) => (
            <UserOverviewCategoryBar
              key={item.label}
              label={item.label}
              count={item.value}
              maxCount={maxCategoryVal}
              colorIndex={index}
            />
          ))}
        </View>
      </View>

      <UserOverviewInsightCard
        icon={Target}
        label="Productivity Advice"
        value={insightText}
        fullWidth
      />
    </ScrollView>
  );
}
