/**
 * RESPONSIBILITY: Completion rate progress card for User Overview (≤60 lines).
 * FLOW: Renders ProgressRing with completion percentage and label.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { UserOverviewProgressRing } from './UserOverviewProgressRing';
import { useThemeTokens } from '../../../../../core/theme/useThemeTokens';

interface UserOverviewCompletionCardProps {
  completionRate: number;
}

export function UserOverviewCompletionCard({
  completionRate,
}: UserOverviewCompletionCardProps) {
  const tokens = useThemeTokens();

  const styles = StyleSheet.create({
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
  });

  return (
    <View style={styles.chartCard}>
      <Text style={styles.chartTitle}>Completion Rate</Text>
      <UserOverviewProgressRing percent={completionRate} size={130} strokeWidth={12}>
        <Text style={styles.percentText}>{completionRate}%</Text>
        <Text style={styles.percentSub}>Completed</Text>
      </UserOverviewProgressRing>
    </View>
  );
}
