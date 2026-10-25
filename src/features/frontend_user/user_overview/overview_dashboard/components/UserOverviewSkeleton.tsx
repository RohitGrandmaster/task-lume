/**
 * RESPONSIBILITY: Layout-mimicking skeleton loading state for Overview Dashboard.
 * FLOW: Rendered during analytics metrics calculation; prevents layout shift.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useThemeTokens } from '../../../../../core/theme/useThemeTokens';

export function UserOverviewSkeleton() {
  const tokens = useThemeTokens();

  const styles = StyleSheet.create({
    container: {
      padding: tokens.space[4],
    },
    kpiRow: {
      flexDirection: 'row',
      gap: tokens.space[3],
      marginBottom: tokens.space[4],
    },
    kpiCard: {
      flex: 1,
      height: 90,
      backgroundColor: tokens.color.card,
      borderRadius: tokens.radius.lg,
      borderWidth: 1,
      borderColor: tokens.color.border,
      padding: tokens.space[3],
      justifyContent: 'center',
    },
    chartCard: {
      height: 180,
      backgroundColor: tokens.color.card,
      borderRadius: tokens.radius.lg,
      borderWidth: 1,
      borderColor: tokens.color.border,
      padding: tokens.space[4],
      justifyContent: 'center',
    },
    titleBar: {
      width: '60%',
      height: 14,
      borderRadius: tokens.radius.sm,
      backgroundColor: tokens.color.skeletonBase,
      marginBottom: tokens.space[2],
    },
    subBar: {
      width: '30%',
      height: 20,
      borderRadius: tokens.radius.sm,
      backgroundColor: tokens.color.skeletonHighlight,
    },
  });

  return (
    <View style={styles.container} accessible={true} accessibilityLabel="Loading overview metrics">
      <View style={styles.kpiRow}>
        <View style={styles.kpiCard}>
          <View style={styles.titleBar} />
          <View style={styles.subBar} />
        </View>
        <View style={styles.kpiCard}>
          <View style={styles.titleBar} />
          <View style={styles.subBar} />
        </View>
      </View>
      <View style={styles.chartCard}>
        <View style={styles.titleBar} />
      </View>
    </View>
  );
}
