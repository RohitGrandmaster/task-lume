/**
 * RESPONSIBILITY: Layout-mimicking skeleton loading state for Reminders list.
 * FLOW: Rendered during alarms / notification schedules fetch.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useThemeTokens } from '../../../../core/theme/useThemeTokens';

export function UserRemindersSkeleton() {
  const tokens = useThemeTokens();

  const styles = StyleSheet.create({
    container: {
      padding: tokens.space[4],
    },
    card: {
      height: 72,
      backgroundColor: tokens.color.card,
      borderRadius: tokens.radius.lg,
      borderWidth: 1,
      borderColor: tokens.color.border,
      padding: tokens.space[4],
      justifyContent: 'center',
      marginBottom: tokens.space[3],
    },
    titleBar: {
      width: '60%',
      height: 14,
      borderRadius: tokens.radius.sm,
      backgroundColor: tokens.color.skeletonBase,
      marginBottom: tokens.space[2],
    },
    timeBar: {
      width: '30%',
      height: 10,
      borderRadius: tokens.radius.sm,
      backgroundColor: tokens.color.skeletonHighlight,
    },
  });

  return (
    <View style={styles.container} accessible={true} accessibilityLabel="Loading reminders">
      {[1, 2, 3, 4].map((i) => (
        <View key={i} style={styles.card}>
          <View style={styles.titleBar} />
          <View style={styles.timeBar} />
        </View>
      ))}
    </View>
  );
}
