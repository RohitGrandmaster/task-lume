/**
 * RESPONSIBILITY: KPI summary section rendering high-level productivity metrics.
 * FLOW: Rendered inside UserOverviewMainView; presents completion rate, streaks, and focus metrics.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Flame, CheckCircle2, Target } from 'lucide-react-native';
import type { OverviewMetrics } from '../types/user_overview.types';
import { useThemeTokens } from '../../../../core/theme/useThemeTokens';
import { displayValue } from '../../../../core/utils/displayValue';

interface UserOverviewKPISectionProps {
  metrics: OverviewMetrics;
}

export function UserOverviewKPISection({ metrics }: UserOverviewKPISectionProps) {
  const tokens = useThemeTokens();

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      gap: tokens.space[3],
      marginBottom: tokens.space[4],
    },
    card: {
      flex: 1,
      backgroundColor: tokens.color.card,
      borderRadius: tokens.radius.lg,
      borderWidth: 1,
      borderColor: tokens.color.border,
      padding: tokens.space[3],
      alignItems: 'center',
    },
    iconWrapper: {
      width: 36,
      height: 36,
      borderRadius: tokens.radius.full,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: tokens.space[2],
    },
    value: {
      ...tokens.typography.kpi,
      fontSize: 22,
      lineHeight: 26,
      color: tokens.color.foreground,
      marginBottom: 2,
    },
    label: {
      ...tokens.typography.labelUppercase,
      color: tokens.color.muted,
      textAlign: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={[styles.iconWrapper, { backgroundColor: tokens.color.primarySubtle }]}>
          <Target size={18} color={tokens.color.primary} />
        </View>
        <Text style={styles.value}>{metrics.completionRate}%</Text>
        <Text style={styles.label}>Done Rate</Text>
      </View>

      <View style={styles.card}>
        <View style={[styles.iconWrapper, { backgroundColor: tokens.color.statusSuccessBg }]}>
          <CheckCircle2 size={18} color={tokens.color.statusSuccessText} />
        </View>
        <Text style={styles.value}>
          {displayValue(metrics.completedTasks)}/{displayValue(metrics.totalTasks)}
        </Text>
        <Text style={styles.label}>Completed</Text>
      </View>

      <View style={styles.card}>
        <View style={[styles.iconWrapper, { backgroundColor: tokens.color.statusWarningBg }]}>
          <Flame size={18} color={tokens.color.statusWarningText} />
        </View>
        <Text style={styles.value}>{metrics.currentStreak}d</Text>
        <Text style={styles.label}>Streak</Text>
      </View>
    </View>
  );
}
