/**
 * RESPONSIBILITY: Layout-mimicking skeleton loading state for Agenda and Calendar view.
 * FLOW: Rendered during monthly dates indexing; avoids full-screen blocking indicators.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useThemeTokens } from '../../../../../core/theme/useThemeTokens';

export function UserCalendarSkeleton() {
  const tokens = useThemeTokens();

  const styles = StyleSheet.create({
    container: {
      padding: tokens.space[4],
    },
    calendarGrid: {
      height: 220,
      backgroundColor: tokens.color.card,
      borderRadius: tokens.radius.lg,
      borderWidth: 1,
      borderColor: tokens.color.border,
      marginBottom: tokens.space[4],
      padding: tokens.space[3],
      justifyContent: 'space-between',
    },
    gridRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    gridCell: {
      width: 28,
      height: 28,
      borderRadius: tokens.radius.sm,
      backgroundColor: tokens.color.skeletonBase,
    },
    agendaItem: {
      height: 60,
      backgroundColor: tokens.color.card,
      borderRadius: tokens.radius.md,
      marginBottom: tokens.space[2],
      padding: tokens.space[3],
      justifyContent: 'center',
    },
    titleBar: {
      width: '50%',
      height: 12,
      borderRadius: tokens.radius.sm,
      backgroundColor: tokens.color.skeletonHighlight,
    },
  });

  return (
    <View style={styles.container} accessible={true} accessibilityLabel="Loading calendar agenda">
      <View style={styles.calendarGrid}>
        {[1, 2, 3, 4].map((row) => (
          <View key={row} style={styles.gridRow}>
            {[1, 2, 3, 4, 5, 6, 7].map((col) => (
              <View key={col} style={styles.gridCell} />
            ))}
          </View>
        ))}
      </View>
      <View style={styles.agendaItem}>
        <View style={styles.titleBar} />
      </View>
      <View style={styles.agendaItem}>
        <View style={styles.titleBar} />
      </View>
    </View>
  );
}
