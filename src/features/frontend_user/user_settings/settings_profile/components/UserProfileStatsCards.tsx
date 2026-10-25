/**
 * RESPONSIBILITY: Statistics summary cards for User Profile view (≤200 lines).
 * FLOW: Displays completed, active, and streak metric cards.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CheckCircle2, Award, Flame } from 'lucide-react-native';
import { useThemeTokens } from '../../../../core/theme/useThemeTokens';

interface UserProfileStatsCardsProps {
  completedTasks: number;
  activeTasks: number;
  streakDays: number;
}

export function UserProfileStatsCards({
  completedTasks,
  activeTasks,
  streakDays,
}: UserProfileStatsCardsProps) {
  const tokens = useThemeTokens();

  const styles = StyleSheet.create({
    statsRow: {
      flexDirection: 'row',
      gap: tokens.space[3],
      marginBottom: tokens.space[5],
    },
    statCard: {
      flex: 1,
      backgroundColor: tokens.color.card,
      borderRadius: tokens.radius.lg,
      borderWidth: 1,
      borderColor: tokens.color.border,
      padding: tokens.space[3],
      alignItems: 'center',
    },
    statValue: {
      ...tokens.typography.headingSm,
      color: tokens.color.primary,
      marginTop: tokens.space[1],
    },
    statLabel: {
      ...tokens.typography.caption,
      color: tokens.color.muted,
      marginTop: 2,
    },
  });

  return (
    <View style={styles.statsRow}>
      <View style={styles.statCard}>
        <CheckCircle2 size={20} color={tokens.color.primary} />
        <Text style={styles.statValue}>{completedTasks}</Text>
        <Text style={styles.statLabel}>Completed</Text>
      </View>
      <View style={styles.statCard}>
        <Award size={20} color={tokens.color.primary} />
        <Text style={styles.statValue}>{activeTasks}</Text>
        <Text style={styles.statLabel}>Active</Text>
      </View>
      <View style={styles.statCard}>
        <Flame size={20} color={tokens.color.primary} />
        <Text style={styles.statValue}>{streakDays}d</Text>
        <Text style={styles.statLabel}>Streak</Text>
      </View>
    </View>
  );
}
