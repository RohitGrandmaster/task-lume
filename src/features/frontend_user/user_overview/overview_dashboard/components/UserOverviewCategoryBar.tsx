/**
 * RESPONSIBILITY: Category progress bar for User Overview (≤200 lines).
 * FLOW: Renders category label, count, and colored percentage fill bar.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeTokens } from '../../../../../core/theme/useThemeTokens';

interface CategoryBarItem {
  label: string;
  value: number;
  color?: string;
}

interface UserOverviewCategoryBarProps {
  item: CategoryBarItem;
  maxValue: number;
}

export function UserOverviewCategoryBar({
  item,
  maxValue,
}: UserOverviewCategoryBarProps) {
  const tokens = useThemeTokens();
  const percent = maxValue > 0 ? Math.min((item.value / maxValue) * 100, 100) : 0;
  const barColor = item.color || tokens.color.primary;

  const styles = StyleSheet.create({
    row: {
      marginBottom: tokens.space[3],
    },
    labelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: tokens.space[1],
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: barColor,
      marginRight: tokens.space[2],
    },
    label: {
      ...tokens.typography.bodySm,
      color: tokens.color.foreground,
      flex: 1,
      fontWeight: '600',
    },
    count: {
      ...tokens.typography.caption,
      color: tokens.color.muted,
      fontWeight: '700',
    },
    track: {
      height: 6,
      borderRadius: 3,
      backgroundColor: tokens.color.border,
      overflow: 'hidden',
    },
    fill: {
      height: '100%',
      borderRadius: 3,
      backgroundColor: barColor,
      width: `${percent}%`,
    },
  });

  return (
    <View style={styles.row}>
      <View style={styles.labelRow}>
        <View style={styles.dot} />
        <Text style={styles.label} numberOfLines={1}>{item.label}</Text>
        <Text style={styles.count}>{item.value}</Text>
      </View>
      <View style={styles.track}>
        <View style={styles.fill} />
      </View>
    </View>
  );
}
